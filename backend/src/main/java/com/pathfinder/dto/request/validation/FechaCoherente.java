package com.pathfinder.dto.request.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = FechaCoherenteValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface FechaCoherente {
    String message() default "La fecha de fin debe ser posterior a la de inicio";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    String inicio();
    String fin();
    String activo() default "";
}
