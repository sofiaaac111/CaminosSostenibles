package purchaseservice.routers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import feign.FeignException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String mensaje = ex.getBindingResult().getFieldErrors().isEmpty()
                ? "Error de validacion"
                : ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("message", mensaje));
    }

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<Map<String, String>> handleFeignException(FeignException ex) {
        String mensaje = "Error al comunicarse con otro servicio";
        try {
            String body = ex.contentUTF8();
            if (body != null && body.contains("\"message\"")) {
                int start = body.indexOf("\"message\":\"") + 11;
                int end   = body.indexOf("\"", start);
                if (start > 10 && end > start) {
                    mensaje = body.substring(start, end);
                }
            }
        } catch (Exception ignored) {}
        return ResponseEntity.badRequest().body(Map.of("message", mensaje));
    }
}
