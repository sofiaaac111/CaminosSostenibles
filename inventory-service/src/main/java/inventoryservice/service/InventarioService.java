package inventoryservice.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import inventoryservice.entity.ExistenciaProducto;
import inventoryservice.entity.Lote;
import inventoryservice.repository.ExistenciaProductoRepository;
import inventoryservice.repository.LoteRepository;

@Service
public class InventarioService {

    @Autowired
    private ExistenciaProductoRepository existenciaProductoRepository;

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

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
        ExistenciaProducto existenciaGuardada = existenciaProductoRepository.save(existencia);

        rabbitTemplate.convertAndSend("cola-auditoria",
                "lote_creado:" + idProducto + ":numeroLote=" + numeroLote + ",cantidad=" + cantidad);

        return existenciaGuardada;
    }

    @Transactional
    public boolean reducirStock(Long idProducto, BigDecimal cantidadAReducir) {
        Optional<ExistenciaProducto> existenciaOpcional = existenciaProductoRepository.findByIdProducto(idProducto);
        if (!existenciaOpcional.isPresent()) {
            return false;
        }
        ExistenciaProducto existencia = existenciaOpcional.get();
        if (existencia.getCantidadTotal().compareTo(cantidadAReducir) < 0) {
            return false; // Stock insuficiente
        }

        // FIFO: reducir desde los lotes más antiguos primero
        List<Lote> lotesDisponibles = loteRepository.encontrarLotesDisponiblesPorProducto(idProducto);
        BigDecimal pendiente = cantidadAReducir;
        for (Lote lote : lotesDisponibles) {
            if (pendiente.compareTo(BigDecimal.ZERO) <= 0) break;
            BigDecimal reducirDelLote = lote.getCantidadLote().min(pendiente);
            lote.setCantidadLote(lote.getCantidadLote().subtract(reducirDelLote));
            pendiente = pendiente.subtract(reducirDelLote);
            loteRepository.save(lote);
        }

        existencia.setCantidadTotal(existencia.getCantidadTotal().subtract(cantidadAReducir));
        existenciaProductoRepository.save(existencia);

        rabbitTemplate.convertAndSend("cola-auditoria",
                "inventario_reducido:" + idProducto + ":cantidad=" + cantidadAReducir);

        return true;
    }

    public List<Lote> obtenerLotesPorVencer(LocalDate fechaLimite) {
        return loteRepository.findAll().stream()
                .filter(l -> l.getFechaVencimiento().isBefore(fechaLimite)
                          && l.getCantidadLote().compareTo(BigDecimal.ZERO) > 0)
                .toList();
    }
}
