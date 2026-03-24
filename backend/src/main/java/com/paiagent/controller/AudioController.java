package com.paiagent.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/audio")
public class AudioController {

    private static final Path AUDIO_DIR = Paths.get("audio");

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getAudio(@PathVariable String filename) {
        try {
            Path filePath = AUDIO_DIR.resolve(filename);
            Resource resource = new FileSystemResource(filePath.toFile());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/mpeg"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
