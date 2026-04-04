package com.supermarket.erp.customerservice.service;

import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.supermarket.erp.customerservice.dto.ClienteActualizarRequest;
import com.supermarket.erp.customerservice.dto.ClienteRegistroRequest;
import com.supermarket.erp.customerservice.dto.LoginRequest;
import com.supermarket.erp.customerservice.entity.Cliente;
import com.supermarket.erp.customerservice.repository.ClienteRepository;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public Cliente registrar(ClienteRegistroRequest request) {
        if (clienteRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese correo.");
        }

        Cliente cliente = new Cliente();
        cliente.setNombre(request.getNombre());
        cliente.setEmail(request.getEmail().toLowerCase());
        cliente.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        cliente.setCiudad(request.getCiudad());
        cliente.setDireccion(request.getDireccion());
        cliente.setTelefono(request.getTelefono());
        cliente.setActivo(true);

        return clienteRepository.save(cliente);
    }

    public Cliente login(LoginRequest request) {
        Optional<Cliente> clienteOpcional = clienteRepository.findByEmail(request.getEmail().toLowerCase());
        if (clienteOpcional.isEmpty()) {
            throw new IllegalArgumentException("Credenciales invalidas.");
        }

        Cliente cliente = clienteOpcional.get();
        if (!Boolean.TRUE.equals(cliente.getActivo())) {
            throw new IllegalArgumentException("La cuenta cliente esta desactivada.");
        }
        if (!passwordEncoder.matches(request.getPassword(), cliente.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales invalidas.");
        }
        return cliente;
    }

    public Optional<Cliente> obtenerPorId(Long idCliente) {
        return clienteRepository.findById(idCliente);
    }

    public Cliente actualizarPerfil(Long idCliente, ClienteActualizarRequest request) {
        Cliente cliente = clienteRepository.findById(idCliente)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado."));

        cliente.setNombre(request.getNombre());
        cliente.setCiudad(request.getCiudad());
        cliente.setDireccion(request.getDireccion());
        cliente.setTelefono(request.getTelefono());

        return clienteRepository.save(cliente);
    }
}
