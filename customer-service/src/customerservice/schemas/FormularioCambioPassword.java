package customerservice.schemas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FormularioCambioPassword {

    @NotBlank
    private String passwordActual;

    @NotBlank
    @Size(min = 6, message = "La nueva contrasena debe tener al menos 6 caracteres.")
    private String passwordNuevo;

    public String getPasswordActual() { return passwordActual; }
    public void setPasswordActual(String passwordActual) { this.passwordActual = passwordActual; }

    public String getPasswordNuevo() { return passwordNuevo; }
    public void setPasswordNuevo(String passwordNuevo) { this.passwordNuevo = passwordNuevo; }
}
