package com.audioFileSenderScheduler.receiveAudioFromClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Slf4j
@RestController
@CrossOrigin("*")
@RequiredArgsConstructor
public class AudioReceiverFullWithTimeStamp {

    private final CropAudio cropAudio;

    @PostMapping({"/upload-audio/{audiofileName}"})
    public String receiveAudio(@RequestParam("audioFile") MultipartFile audioFile,
                               @RequestParam("timeStampTextFile") MultipartFile timeStampTextFile,
                               @PathVariable String audiofileName) {
        log.info("AudioReceiverFullWithTimeStamp|uploadAudio|fileName = {}", audiofileName);
        String timeStampFileName = audiofileName + "_timeStamp";
        log.info("AudioReceiverFullWithTimeStamp|uploadAudio|timeStampFileName = {}", timeStampFileName);
        try {
            String uploadDir = "uploads"; // Specify your upload directory
            log.info("AudioReceiverFullWithTimeStamp|ReceiveFullAudio|uploadDir = {}", uploadDir);
            Path directory = Paths.get(uploadDir);
            if (!Files.exists(directory, new LinkOption[0])) {
                Files.createDirectories(directory);
            }

            // Resolve file path for audio file and get the common base name with suffix
            Path audioFilePath = resolveFilePath(uploadDir, audiofileName, ".wav");
            Files.copy(audioFile.getInputStream(), audioFilePath);
//            String baseName = getBaseName(audioFilePath.getFileName().toString(), ".wav");

            // Use the same base name for the timestamp file
            Path timeStampFilePath = resolveFilePath(uploadDir, timeStampFileName, ".txt");
            Files.copy(timeStampTextFile.getInputStream(), timeStampFilePath);

            log.info("AudioReceiverFullWithTimeStamp|uploadAudio|audio and timestamp saved successfully," +
                    "audioFileName = {}, timeStampFileName = {}", audioFilePath.getFileName(), timeStampFilePath.getFileName());

            List<String> timestamps = readTimeStamps(timeStampFilePath);
            List<String> croppedFileNames = getCroppedFileName(timeStampFilePath);
            cropAudio.cropAudioByTimestamps(audioFilePath, timestamps, croppedFileNames);
            return "Audio file and timestamp file uploaded and processing started!";
        } catch (Exception exception) {
            log.error("AudioReceiverFullWithTimeStamp|receiveAudio|error = {}", exception.getMessage());
            return "Failed to upload and process audio file!";
        }
    }

    private Path resolveFilePath(String uploadDir, String fileName, String extension) {
        int counter = 0;
        Path filePath = Paths.get(uploadDir, fileName + extension);
        while (Files.exists(filePath)) {
            counter++;
            filePath = Paths.get(uploadDir, fileName + "_" + counter + extension);
        }
        return filePath;
    }

    private String getBaseName(String fileName, String extension) {
        if (fileName.endsWith(extension)) {
            return fileName.substring(0, fileName.length() - extension.length());
        }
        return fileName;
    }

    private List<String> readTimeStamps(Path timeStampFilePath) throws IOException {
        List<String> timestamps = new ArrayList<>();
        try (BufferedReader br = Files.newBufferedReader(timeStampFilePath)) {
            timestamps = br.lines().collect(Collectors.toList());
        }
        List<String> recordingStartAndEndTime = new ArrayList<>();
        timestamps.forEach(eachPatient -> {
            var list = eachPatient.split(" ");
            recordingStartAndEndTime.add(list[0] + " " + list[1]);
        });
        return recordingStartAndEndTime;
    }

    private List<String> getCroppedFileName(Path timeStampFilePath) throws IOException {
        List<String> timestamps = new ArrayList<>();
        try (BufferedReader br = Files.newBufferedReader(timeStampFilePath)) {
            timestamps = br.lines().collect(Collectors.toList());
        }
        List<String> croppedFileName = new ArrayList<>();
        timestamps.forEach(eachPatient -> {
            var list = eachPatient.split(" ");
            croppedFileName.add(list[2]);
        });
        return croppedFileName;
    }
}