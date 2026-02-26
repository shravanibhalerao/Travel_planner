package com.travelplaner.travelplaner.repository;

import com.travelplaner.travelplaner.model.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TrainRepository extends JpaRepository<Train, Long> {

    @Query("SELECT t FROM Train t WHERE " +
           "LOWER(t.source)      LIKE LOWER(CONCAT('%', :source, '%')) AND " +
           "LOWER(t.destination) LIKE LOWER(CONCAT('%', :destination, '%'))")
    List<Train> searchTrains(
            @Param("source") String source,
            @Param("destination") String destination);
}