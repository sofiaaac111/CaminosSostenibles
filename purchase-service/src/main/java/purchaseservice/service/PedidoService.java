package purchaseservice.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import purchaseservice.client.ClienteEscaneo;
import purchaseservice.client.ClienteProductos;
import purchaseservice.dto.CheckoutItemRequest;
import purchaseservice.dto.CheckoutRequest;
import purchaseservice.dto.PedidoItemResponse;
import purchaseservice.dto.PedidoResponse;
import purchaseservice.dto.ProductoResumenDto;
import purchaseservice.entity.Pedido;
import purchaseservice.entity.PedidoItem;
import purchaseservice.repository.PedidoRepository;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ClienteProductos clienteProductos;
    private final ClienteEscaneo clienteEscaneo;

    public PedidoService(PedidoRepository pedidoRepository,
                        ClienteProductos clienteProductos,
                        ClienteEscaneo clienteEscaneo) {
        this.pedidoRepository = pedidoRepository;
        this.clienteProductos = clienteProductos;
        this.clienteEscaneo = clienteEscaneo;
    }

    @Transactional
    public PedidoResponse checkout(CheckoutRequest request) {
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

        for (CheckoutItemRequest itemRequest : request.getItems()) {
            ProductoResumenDto producto = clienteProductos.obtenerProductoPorId(itemRequest.getIdProducto());
            if (producto == null || producto.getIdProducto() == null) {
                throw new IllegalArgumentException("Producto no encontrado: " + itemRequest.getIdProducto());
            }
            if (Boolean.FALSE.equals(producto.getActivo())) {
                throw new IllegalArgumentException("Producto inactivo/no disponible: " + producto.getNombreProducto());
            }

            String respuestaVenta = clienteEscaneo.venderOnline(itemRequest.getIdProducto(), itemRequest.getCantidad());
            if (respuestaVenta == null || respuestaVenta.toLowerCase().startsWith("error")) {
                throw new IllegalArgumentException("No se pudo procesar producto " + producto.getNombreProducto() + ": " + respuestaVenta);
            }

            PedidoItem item = new PedidoItem();
            item.setIdProducto(producto.getIdProducto());
            item.setCodigoProducto(producto.getCodigoProducto());
            item.setNombreProducto(producto.getNombreProducto());
            item.setPrecioUnitario(producto.getPrecioProducto());
            item.setCantidad(itemRequest.getCantidad());

            BigDecimal subtotal = producto.getPrecioProducto().multiply(itemRequest.getCantidad());
            item.setSubtotal(subtotal);
            total = total.add(subtotal);

            pedido.agregarItem(item);
        }

        pedido.setTotalBruto(total);
        pedido.setTotalFinal(total);

        Pedido guardado = pedidoRepository.save(pedido);
        return toResponse(guardado);
    }

    public List<PedidoResponse> listarPorCliente(Long idCliente) {
        return pedidoRepository.findByIdClienteOrderByFechaCreacionDesc(idCliente)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PedidoResponse> listarTodos() {
        return pedidoRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaCreacion"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private PedidoResponse toResponse(Pedido pedido) {
        PedidoResponse response = new PedidoResponse();
        response.setIdPedido(pedido.getIdPedido());
        response.setIdCliente(pedido.getIdCliente());
        response.setEstado(pedido.getEstado());
        response.setMetodoPago(pedido.getMetodoPago());
        response.setTotal(pedido.getTotalFinal());
        response.setMoneda(pedido.getMoneda());
        response.setFechaCreacion(pedido.getFechaCreacion());

        List<PedidoItemResponse> items = pedido.getItems().stream().map(item -> {
            PedidoItemResponse itemResponse = new PedidoItemResponse();
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
