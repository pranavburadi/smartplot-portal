package com.example.smartplot.service;

import com.example.smartplot.dto.PlotRequest;
import com.example.smartplot.dto.PlotResponse;
import com.example.smartplot.model.Plot;
import com.example.smartplot.repository.PlotRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class PlotService {

    private final PlotRepository plotRepository;

    public PlotService(PlotRepository plotRepository) {
        this.plotRepository = plotRepository;
    }

    public PlotResponse createPlot(PlotRequest request) {
        String plotNumber = request.getPlotNumber().trim();

        if (plotRepository.existsByPlotNumber(plotNumber)) {
            throw new IllegalArgumentException("Plot number already exists");
        }

        Plot plot = new Plot();
        plot.setPlotNumber(plotNumber);
        plot.setOwnerName(request.getOwnerName().trim());
        plot.setLocation(request.getLocation().trim());
        plot.setAreaSqft(request.getAreaSqft());
        plot.setPrice(request.getPrice());
        plot.setStatus(request.getStatus().trim().toUpperCase());

        Plot savedPlot = plotRepository.save(plot);
        return mapToResponse(savedPlot);
    }

    public List<PlotResponse> getAllPlots(String search, String status) {
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase();
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();

        return plotRepository.findAll(Sort.by(Sort.Direction.DESC, "plotId"))
                .stream()
                .filter(plot -> matchesSearch(plot, normalizedSearch))
                .filter(plot -> matchesStatus(plot, normalizedStatus))
                .map(this::mapToResponse)
                .toList();
    }

    public PlotResponse updatePlot(Integer plotId, PlotRequest request) {
        Plot plot = plotRepository.findById(plotId)
                .orElseThrow(() -> new IllegalArgumentException("Plot not found"));

        String plotNumber = request.getPlotNumber().trim();
        if (plotRepository.existsByPlotNumberAndPlotIdNot(plotNumber, plotId)) {
            throw new IllegalArgumentException("Plot number already exists");
        }

        plot.setPlotNumber(plotNumber);
        plot.setOwnerName(request.getOwnerName().trim());
        plot.setLocation(request.getLocation().trim());
        plot.setAreaSqft(request.getAreaSqft());
        plot.setPrice(request.getPrice());
        plot.setStatus(request.getStatus().trim().toUpperCase());

        Plot savedPlot = plotRepository.save(plot);
        return mapToResponse(savedPlot);
    }

    public void deletePlot(Integer plotId) {
        Plot plot = plotRepository.findById(plotId)
                .orElseThrow(() -> new IllegalArgumentException("Plot not found"));
        plotRepository.delete(plot);
    }

    private boolean matchesSearch(Plot plot, String search) {
        if (search.isEmpty()) {
            return true;
        }

        return plot.getPlotNumber().toLowerCase().contains(search)
                || plot.getOwnerName().toLowerCase().contains(search)
                || plot.getLocation().toLowerCase().contains(search)
                || plot.getStatus().toLowerCase().contains(search);
    }

    private boolean matchesStatus(Plot plot, String status) {
        if (status.isEmpty() || "ALL".equals(status)) {
            return true;
        }

        return plot.getStatus().equalsIgnoreCase(status);
    }

    private PlotResponse mapToResponse(Plot plot) {
        return new PlotResponse(
                plot.getPlotId(),
                plot.getPlotNumber(),
                plot.getOwnerName(),
                plot.getLocation(),
                plot.getAreaSqft(),
                plot.getPrice(),
                plot.getStatus()
        );
    }
}
