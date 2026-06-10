package com.pathfinder.dto.request.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

public class FechaCoherenteValidator
        implements ConstraintValidator<FechaCoherente, Object> {

    private String campoInicio;
    private String campoFin;
    private String campoActivo;

    @Override
    public void initialize(FechaCoherente ann) {
        this.campoInicio  = ann.inicio();
        this.campoFin     = ann.fin();
        this.campoActivo  = ann.activo();
    }

    @Override
    public boolean isValid(Object obj, ConstraintValidatorContext ctx) {
        if (obj == null) return true;

        BeanWrapper bw = new BeanWrapperImpl(obj);

        // Si está activo (trabajo actual / en curso), no se valida fechaFin
        if (!campoActivo.isBlank()) {
            Boolean activo = (Boolean) bw.getPropertyValue(campoActivo);
            if (Boolean.TRUE.equals(activo)) return true;
        }

        String inicioStr = (String) bw.getPropertyValue(campoInicio);
        String finStr    = (String) bw.getPropertyValue(campoFin);

        // Si alguna fecha es null/vacía, las anotaciones @Pattern ya se encargan
        if (inicioStr == null || inicioStr.isBlank()) return true;
        if (finStr    == null || finStr.isBlank())    return true;

        try {
            LocalDate inicio = LocalDate.parse(inicioStr);
            LocalDate fin    = LocalDate.parse(finStr);

            // fechaFin no puede ser en el futuro para entradas cerradas
            if (fin.isAfter(LocalDate.now())) {
                ctx.disableDefaultConstraintViolation();
                ctx.buildConstraintViolationWithTemplate(
                        "La fecha de fin no puede ser una fecha futura")
                   .addPropertyNode(campoFin)
                   .addConstraintViolation();
                return false;
            }

            // fechaFin debe ser posterior a fechaInicio
            if (!fin.isAfter(inicio)) {
                ctx.disableDefaultConstraintViolation();
                ctx.buildConstraintViolationWithTemplate(
                        "La fecha de fin debe ser posterior a la fecha de inicio")
                   .addPropertyNode(campoFin)
                   .addConstraintViolation();
                return false;
            }

            return true;

        } catch (DateTimeParseException e) {
            // El formato ya lo valida @Pattern, aquí solo evitamos NPE
            return true;
        }
    }
}
