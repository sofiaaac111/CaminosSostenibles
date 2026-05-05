package purchaseservice.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import purchaseservice.client.ClienteInventario;
import purchaseservice.client.ClienteProductos;
import purchaseservice.crud.PedidoRepository;
import purchaseservice.models.Pedido;
import purchaseservice.models.PedidoItem;
import purchaseservice.schemas.DatosPedido;
import purchaseservice.schemas.FormularioCompra;
import purchaseservice.schemas.ItemCompra;
import purchaseservice.schemas.ItemDatosPedido;
import purchaseservice.schemas.ResumenProducto;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ClienteProductos clienteProductos;
    private final ClienteInventario clienteInventario;

    public PedidoService(PedidoRepository pedidoRepository,
                         ClienteProductos clienteProductos,
                         ClienteInventario clienteInventario) {
        this.pedidoRepository = pedidoRepository;
        this.clienteProductos = clienteProductos;
        this.clienteInventario = clienteInventario;
    }

    @Transactional
    public DatosPedido checkout(FormularioCompra request) {
        Pedido pedido = new Pedido();
        pedido.setIdCliente(request.getIdCliente());
        pedido.setEstado("PAGADO");
        pedido.setMetodoPago(request.getMetodoPago());
        pedido.setReferenciaPago("SIM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        pedido.setMoneda("COP");
        pedido.setCiudadEntrega(request.getCiudadEntrega());
        pedido.setDireccionEntrega(request.getDireccionEntrega());
        pedido.setNotas(request.getNotas());

        BigDecimal total = BigDecimal.ZERO;
        List<Long> idsReserva = new ArrayList<>();

        // PASO 1: Validar productos y reservar stock para todos los items
        for (ItemCompra itemRequest : request.getItems()) {
            ResumenProducto producto = clienteProductos.obtenerProductoPorId(itemRequest.getIdProducto());
            if (producto == null || producto.getIdProducto() == null) {
                throw new IllegalArgumentException("Producto no encontrado: " + itemRequest.getIdProducto());
            }
            if (Boolean.FALSE.equals(producto.getActivo())) {
                throw new IllegalArgumentException("Producto no disponible: " + producto.getNombreProducto());
            }

            Long idReserva = clienteInventario.reservarStock(
                    itemRequest.getIdProducto(),
                    itemRequest.getCantidad(),
                    request.getIdCliente());
            idsReserva.add(idReserva);

            PedidoItem item = new PedidoItem();
            item.setIdProducto(producto.getIdProducto());
            item.setCodigoProducto(producto.getCodigoProducto());
            item.setNombreProducto(producto.getNombreProducto());
            item.setPrecioUnitario(producto.getPrecioProducto());
            item.setCantidad(itemRequest.getCantidad());
            item.setSubtotal(producto.getPrecioProducto().multiply(itemRequest.getCantidad()));
            total = total.add(item.getSubtotal());
            pedido.agregarItem(item);
        }

        pedido.setTotalBruto(total);
        pedido.setTotalFinal(total);
        Pedido guardado = pedidoRepository.save(pedido);

        // PASO 2: Confirmar todas las reservas (descuenta el stock real)
        for (Long idReserva : idsReserva) {
            ResponseEntity<String> respuesta = clienteInventario.confirmarReserva(idReserva);
            if (!respuesta.getStatusCode().is2xxSuccessful()) {
                throw new IllegalArgumentException("Error al confirmar stock: " + respuesta.getBody());
            }
        }

        return toResponse(guardado);
    }

    public List<DatosPedido> listarPorCliente(Long idCliente) {
        return pedidoRepository.findByIdClienteOrderByFechaCreacionDesc(idCliente)
                .stream().map(this::toResponse).toList();
    }

    public List<DatosPedido> listarTodos() {
        return pedidoRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaCreacion"))
                .stream().map(this::toResponse).toList();
    }

    private DatosPedido toResponse(Pedido pedido) {
        DatosPedido response = new DatosPedido();
        response.setIdPedido(pedido.getIdPedido());
        response.setIdCliente(pedido.getIdCliente());
        response.setEstado(pedido.getEstado());
        response.setMetodoPago(pedido.getMetodoPago());
        response.setTotal(pedido.getTotalFinal());
        response.setMoneda(pedido.getMoneda());
        response.setFechaCreacion(pedido.getFechaCreacion());

        List<ItemDatosPedido> items = pedido.getItems().stream().map(item -> {
            ItemDatosPedido itemResponse = new ItemDatosPedido();
            itemResponse.setIdProducto(item.getIdProducto());
            itemResponse.setCodigoProducto(item.getCodigoProducto());
            itemResponse.setNombreProducto(item.getNombreProducto());
            itemResponse.setPrecioUnitario(item.getPrecioUnitario());
            itemResponse.setCantidad(item.getCantidad());
            itemResponse.setSubtotal(item.getSubtotal());
            return itemResponse;
        }).toList();

        response.setItems(items);
        return response;
    }
}
