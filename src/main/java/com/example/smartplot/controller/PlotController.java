package com.example.smartplot.controller;

import com.example.smartplot.dto.PlotRequest;
import com.example.smartplot.dto.PlotResponse;
import com.example.smartplot.service.PlotService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PlotController {

    private final PlotService plotService;

    public PlotController(PlotService plotService) {
        this.plotService = plotService;
    }

    @PostMapping("/plots")
    @ResponseStatus(HttpStatus.CREATED)
    public PlotResponse createPlot(@Valid @RequestBody PlotRequest request) {
        return plotService.createPlot(request);
    }

    @GetMapping("/plots")
    public List<PlotResponse> getAllPlots(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        return plotService.getAllPlots(search, status);
    }

    @PutMapping("/plots/{plotId}")
    public PlotResponse updatePlot(
            @PathVariable Integer plotId,
            @Valid @RequestBody PlotRequest request) {
        return plotService.updatePlot(plotId, request);
    }

    @DeleteMapping("/plots/{plotId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePlot(@PathVariable Integer plotId) {
        plotService.deletePlot(plotId);
    }
}
