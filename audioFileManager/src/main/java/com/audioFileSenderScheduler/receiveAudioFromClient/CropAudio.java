package com.audioFileSenderScheduler.receiveAudioFromClient;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;


@Slf4j
@Service
@EnableAsync
public class CropAudio {

    @Async
    public void cropAudioByTimestamps(Path audioFilePath, List<String> timestamps, List<String> croppedFileName) throws IOException {
        for (int i=0;i<timestamps.size();i++) {
            String[] parts = timestamps.get(i).split(" ");
            String startTime = parts[0], endTime = parts[1];
            cropAudioByTimestamp(audioFilePath, croppedFileName.get(i), startTime, endTime);
        }
    }

    private void cropAudioByTimestamp(Path audioFilePath, String croppedNewFileName, String startTime, String endTime) throws IOException {
//        String outputFilePath = audioFilePath.toString().substring(0, audioFilePath.toString().lastIndexOf('.'))
//                + "_cropped_" + startTime.replace(":", "_") + "-" + endTime.replace(":", "_") + ".wav";


//        String outputFilePath = audioFilePath.toString().substring(0, audioFilePath.toString().lastIndexOf('.'))
//                + "_" + croppedNewFileName + ".wav";

        String outputFilePath = croppedNewFileName + ".wav";

        String[] command = {"ffmpeg", "-i", audioFilePath.toString(), "-ss", startTime, "-to", endTime, "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "1", outputFilePath};
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        Process process = processBuilder.start();

        try {
            process.waitFor();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
