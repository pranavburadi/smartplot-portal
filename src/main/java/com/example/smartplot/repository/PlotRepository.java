package com.example.smartplot.repository;

import com.example.smartplot.model.Plot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlotRepository extends JpaRepository<Plot, Integer> {

    boolean existsByPlotNumber(String plotNumber);

    boolean existsByPlotNumberAndPlotIdNot(String plotNumber, Integer plotId);
}
