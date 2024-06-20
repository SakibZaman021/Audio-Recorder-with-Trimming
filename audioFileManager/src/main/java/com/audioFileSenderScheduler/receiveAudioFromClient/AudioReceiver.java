//package com.audioFileSenderScheduler.receiveAudioFromClient;
//
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.nio.file.*;
//
//@Slf4j
//@RestController
//@CrossOrigin({"*"})
//public class AudioReceiver {
//
//    @PostMapping({"/upload-audio/{fileName}"})
//    public String uploadAudio(@RequestBody MultipartFile audioFile, @PathVariable String fileName) {
//        System.out.println("new file found to save = " + fileName);
//        try {
//            String uploadDir = "";
//            log.info("uploadDir = {}", uploadDir);
//            Path directory = Paths.get(uploadDir);
//            if (!Files.exists(directory, new LinkOption[0])) {
//                Files.createDirectories(directory);
//            }
//            Path filePath = Paths.get(uploadDir, fileName + ".wav");
//            Files.copy(audioFile.getInputStream(), filePath, new CopyOption[0]);
//            return "Audio file uploaded successfully!";
//        } catch (Exception var6) {
//            return "Failed to upload audio file!";
//        }
//    }
//}
