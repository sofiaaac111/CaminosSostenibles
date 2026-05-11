package inventoryservice.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import inventoryservice.crud.ExistenciaProductoRepository;
import inventoryservice.crud.LoteRepository;
import inventoryservice.crud.ReservaStockRepository;
import inventoryservice.models.ExistenciaProducto;
import inventoryservice.models.Lote;
import inventoryservice.models.ReservaStock;

@Service
public class InventarioService {

    @Autowired
    private ExistenciaProductoRepository existenciaProductoRepository;

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private ReservaStockRepository reservaStockRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${PRODUCT_SERVICE_URL:http://product-service:8081}")
    private String productServiceUrl;

    public List<ExistenciaProducto> obtenerTodasLasExistencias() {
        return existenciaProductoRepository.findAll();
    }

    public Optional<ExistenciaProducto> obtenerExistenciaPorProducto(Long idProducto) {
        return existenciaProductoRepository.findByIdProducto(idProducto);
    }

    public List<Lote> obtenerLotesPorProducto(Long idProducto) {
        return loteRepository.findByIdProductoOrderByFechaIngresoAsc(idProducto);
    }

    @Transactional
    public ExistenciaProducto agregarStock(Long idProducto, String numeroLote,
            BigDecimal cantidad, LocalDate fechaVencimiento) {
        Lote lote = new Lote(numeroLote, idProducto, cantidad, fechaVencimiento, LocalDate.now());
        loteRepository.save(lote);

        Optional<ExistenciaProducto> existenciaOpcional = existenciaProductoRepository.findByIdProducto(idProducto);
        ExistenciaProducto existencia;
        if (existenciaOpcional.isPresent()) {
            existencia = existenciaOpcional.get();
            existencia.setCantidadTotal(existencia.getCantidadTotal().add(cantidad));
        } else {
            existencia = new ExistenciaProducto(idProducto, cantidad);
        }
        ExistenciaProducto guardada = existenciaProductoRepository.save(existencia);

        try {
            restTemplate.put(productServiceUrl + "/api/productos/" + idProducto + "/estado?activo=true", null);
        } catch (Exception ignored) {}

        return guardada;
    }

    @Transactional
    public boolean reducirStock(Long idProducto, BigDecimal cantidadAReducir) {
        Optional<ExistenciaProducto> existenciaOpcional = existenciaProductoRepository
                .buscarConBloqueo(idProducto);
        if (!existenciaOpcional.isPresent())
            return false;

        ExistenciaProducto existencia = existenciaOpcional.get();
        if (existencia.getCantidadTotal().compareTo(cantidadAReducir) < 0)
            return false;

        List<Lote> lotesDisponibles = loteRepository.encontrarLotesDisponiblesPorProducto(idProducto);
        BigDecimal pendiente = cantidadAReducir;
        for (Lote lote : lotesDisponibles) {
            if (pendiente.compareTo(BigDecimal.ZERO) <= 0)
                break;
            BigDecimal reducirDelLote = lote.getCantidadLote().min(pendiente);
            lote.setCantidadLote(lote.getCantidadLote().subtract(reducirDelLote));
            pendiente = pendiente.subtract(reducirDelLote);
            loteRepository.save(lote);
        }

        existencia.setCantidadTotal(existencia.getCantidadTotal().subtract(cantidadAReducir));
        existenciaProductoRepository.save(existencia);
        return true;
    }

    public List<Lote> obtenerLotesPorVencer(LocalDate fechaLimite) {
        return loteRepository.findAll().stream()
                .filter(l -> l.getFechaVencimiento().isBefore(fechaLimite)
                        && l.getCantidadLote().compareTo(BigDecimal.ZERO) > 0)
                .toList();
    }

    @Transactional
    public Long reservarStock(Long idProducto, BigDecimal cantidad, Long idCliente) {
        // Cuánto está ya apartado por otras reservas activas
        BigDecimal yaReservado = reservaStockRepository.sumarCantidadReservada(idProducto, LocalDateTime.now());

        // Stock real actual
        ExistenciaProducto existencia = existenciaProductoRepository
                .findByIdProducto(idProducto)
                .orElseThrow(() -> new IllegalArgumentException("Producto sin registro de inventario"));

        // Stock disponible = total - lo que ya está apartado
        BigDecimal disponibleReal = existencia.getCantidadTotal().subtract(yaReservado);

        if (disponibleReal.compareTo(cantidad) < 0) {
            throw new IllegalArgumentException("Stock insuficiente. Disponible: " + disponibleReal);
        }

        ReservaStock reserva = new ReservaStock(
                idProducto, cantidad, idCliente,
                LocalDateTime.now().plusMinutes(10));
        return reservaStockRepository.save(reserva).getIdReserva();
    }

    @Transactional
    public boolean confirmarReserva(Long idReserva) {
        ReservaStock reserva = reservaStockRepository.findById(idReserva)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada: " + idReserva));

        if (reserva.getConfirmada())
            return true;

        if (reserva.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("La reserva expiró. Vuelve al carrito.");
        }

        boolean descontado = reducirStock(reserva.getIdProducto(), reserva.getCantidad());
        if (!descontado) {
            throw new IllegalArgumentException("No se pudo descontar el stock al confirmar la reserva.");
        }

        reserva.setConfirmada(true);
        reservaStockRepository.save(reserva);
        return true;
    }

    @Scheduled(fixedDelay = 60000)
    public void limpiarReservasExpiradas() {
        List<ReservaStock> expiradas = reservaStockRepository
                .findByConfirmadaFalseAndFechaExpiracionBefore(LocalDateTime.now());
        reservaStockRepository.deleteAll(expiradas);
    }
}
