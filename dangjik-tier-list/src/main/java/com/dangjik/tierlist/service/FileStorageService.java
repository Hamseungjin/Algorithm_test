package com.dangjik.tierlist.service;

import com.dangjik.tierlist.model.DutyOfficer;
import com.dangjik.tierlist.model.Rank;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class FileStorageService {

    @Value("${app.data.path}")
    private String dataPath;

    private final ObjectMapper mapper = new ObjectMapper()
            .enable(SerializationFeature.INDENT_OUTPUT);

    private File officersFile;
    private File ranksFile;

    @PostConstruct
    public void init() throws IOException {
        File dir = new File(dataPath);
        if (!dir.exists()) dir.mkdirs();

        officersFile = new File(dir, "officers.json");
        ranksFile    = new File(dir, "ranks.json");

        if (!officersFile.exists()) {
            mapper.writeValue(officersFile, new ArrayList<>());
        }
        if (!ranksFile.exists()) {
            // 기본 계급 목록
            List<Rank> defaults = List.of(
                    new Rank("1", "소위", 10),
                    new Rank("2", "중위", 9),
                    new Rank("3", "대위", 8),
                    new Rank("4", "소령", 7),
                    new Rank("5", "중령", 6),
                    new Rank("6", "대령", 5),
                    new Rank("7", "준장", 4),
                    new Rank("8", "중장", 3),
                    new Rank("9", "대장", 2)
            );
            mapper.writeValue(ranksFile, defaults);
        }
    }

    // ── Officers ──

    public synchronized List<DutyOfficer> loadOfficers() {
        try {
            return mapper.readValue(officersFile, new TypeReference<List<DutyOfficer>>() {});
        } catch (IOException e) {
            return new ArrayList<>();
        }
    }

    public synchronized void saveOfficers(List<DutyOfficer> officers) {
        try {
            mapper.writeValue(officersFile, officers);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save officers", e);
        }
    }

    // ── Ranks ──

    public synchronized List<Rank> loadRanks() {
        try {
            return mapper.readValue(ranksFile, new TypeReference<List<Rank>>() {});
        } catch (IOException e) {
            return new ArrayList<>();
        }
    }

    public synchronized void saveRanks(List<Rank> ranks) {
        try {
            mapper.writeValue(ranksFile, ranks);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save ranks", e);
        }
    }
}
