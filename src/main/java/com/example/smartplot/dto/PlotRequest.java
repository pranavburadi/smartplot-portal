package com.example.smartplot.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class PlotRequest {

    @NotBlank(message = "Plot number is required")
    @Size(max = 50, message = "Plot number must be at most 50 characters")
    private String plotNumber;

    @NotBlank(message = "Owner name is required")
    @Size(max = 100, message = "Owner name must be at most 100 characters")
    private String ownerName;

    @NotBlank(message = "Location is required")
    @Size(max = 150, message = "Location must be at most 150 characters")
    private String location;

    @NotNull(message = "Area is required")
    @Min(value = 100, message = "Area must be at least 100 sqft")
    private Integer areaSqft;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "1.00", message = "Price must be greater than 0")
    private BigDecimal price;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "AVAILABLE|RESERVED|SOLD", message = "Status must be AVAILABLE, RESERVED, or SOLD")
    private String status;

    public String getPlotNumber() {
        return plotNumber;
    }

    public void setPlotNumber(String plotNumber) {
        this.plotNumber = plotNumber;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getAreaSqft() {
        return areaSqft;
    }

    public void setAreaSqft(Integer areaSqft) {
        this.areaSqft = areaSqft;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
