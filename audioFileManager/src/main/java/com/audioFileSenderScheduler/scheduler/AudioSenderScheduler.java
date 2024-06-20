package com.audioFileSenderScheduler.scheduler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;

@Slf4j
@Component
//@EnableAsync
public class AudioSenderScheduler {

    public String fileDirectory;

    private RestTemplate restTemplate = new RestTemplate();

    //    https://712e-103-197-153-48.ngrok-free.app
    private String uploadUrl = "";

    private String wavAudioFileName = "audioFile";
    private String successFulMessage = "Audio file uploaded successfully!";
    private String alreadySentFileFolder = "";

    //    @Async
//    @Scheduled(fixedDelay = 1000 * 5)
    public void sendWavFile() throws InterruptedException {
        try {
            if(fileDirectory == null) throw new FileNotFoundException("File Directory not set / valid. Please set filePath while running the jar file");
            File directory = new File(fileDirectory);
            File[] files = directory.listFiles((dir, name) -> name.endsWith(".wav"));
            if (files != null && files.length > 0) {
                for (File file : files) {
                    if (file.isFile()) { // Ensure it's a file, not a directory
                        log.info("Processing wav file: {}", file.getName());
                        boolean sent = sendFileViaPostRequest(file);
                        if(sent) {
                            moveFileToAnotherFolder(file, alreadySentFileFolder);
                        }
                    }
                    Thread.sleep(5000);
                }
            } else {
                log.info("No wav files found in directory.");
            }
        }
        catch (Exception exception) {
            log.info("Exception occurred while sending wav file", exception);
        }

    }

    private void moveFileToAnotherFolder(File file, String destinationFolder) {
        try {
            Path alreadySentFolderPath = Paths.get(alreadySentFileFolder);
            if (!Files.exists(alreadySentFolderPath)) {
                Files.createDirectories(alreadySentFolderPath);
                log.info("alreadySent folder created: {}", alreadySentFileFolder);
            }
            Files.move(file.toPath(), Paths.get(destinationFolder, file.getName()));
            log.info("File {} moved to [ alreadySent ] folder", file.getName());
        } catch (IOException e) {
            log.error("Error moving file {} to destination folder", file.getName(), e);
        }
    }

    private boolean sendFileViaPostRequest(File file) {
        try {
            MultiValueMap<String, Object> body  = new LinkedMultiValueMap<>();
            body.add(wavAudioFileName, new FileSystemResource(file.getPath()));
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            String uploadUrlWithFileName = uploadUrl + file.getName();
            log.info("uploadUrlWithFileName = {}", uploadUrlWithFileName);
            ResponseEntity<String> response = restTemplate.postForEntity(uploadUrlWithFileName, requestEntity, String.class);
            log.info("Response from server: {}", response.getBody());
            return Objects.equals(response.getBody(), successFulMessage);
        } catch (Exception e) {
            log.error("Error reading or sending file {}", file.getName(), e);
            return false;
        }
    }

    public void setFileDirectory(String audioFilePath, String backUpFolder, String uploadUrl) {
        if(Objects.isNull(audioFilePath)) audioFilePath = "";
        if(audioFilePath.isEmpty()) audioFilePath = "";
        this.fileDirectory = audioFilePath;
        System.out.println();
        if(Objects.isNull(backUpFolder) || backUpFolder.isEmpty()) {
            this.alreadySentFileFolder = audioFilePath + "/alreadySend";
        }
        else this.alreadySentFileFolder = backUpFolder;
        this.uploadUrl = uploadUrl + "/upload-audio/";
    }
}