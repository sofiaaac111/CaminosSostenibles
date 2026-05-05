package customerservice.schemas;

import customerservice.models.Cliente;

public class DatosCliente {

    private Long idCliente;
    private String nombre;
    private String email;
    private String ciudad;
    private String direccion;
    private String telefono;
    private Boolean activo;

    public static DatosCliente fromEntity(Cliente cliente) {
        DatosCliente response = new DatosCliente();
        response.setIdCliente(cliente.getIdCliente());
        response.setNombre(cliente.getNombre());
        response.setEmail(cliente.getEmail());
        response.setCiudad(cliente.getCiudad());
        response.setDireccion(cliente.getDireccion());
        response.setTelefono(cliente.getTelefono());
        response.setActivo(cliente.getActivo());
        return response;
    }

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
