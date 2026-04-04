package com.supermarket.erp.scannerservice.configuracion;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ConfiguracionRabbitMQ {

    // Declara la cola "cola-auditoria" como durable=true para que sobreviva reinicios de RabbitMQ
    @Bean
    public Queue colaAuditoria() {
        return new Queue("cola-auditoria", true);
    }
}
