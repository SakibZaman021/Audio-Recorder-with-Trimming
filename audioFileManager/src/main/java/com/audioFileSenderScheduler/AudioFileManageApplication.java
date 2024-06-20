package com.audioFileSenderScheduler;

import com.audioFileSenderScheduler.scheduler.AudioSenderScheduler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@EnableScheduling
@SpringBootApplication
@RequiredArgsConstructor
public class AudioFileManageApplication implements CommandLineRunner {

	private final AudioSenderScheduler audioSenderScheduler;
	private final ApplicationContext applicationContext;

	public static void main(String[] args) {
		SpringApplication.run(AudioFileManageApplication.class, args);
	}


	@Override
	public void run	(String... args) {
		Map<String, String> map = Stream.of(args)
				.map(str -> str.split("="))
				.filter(parts -> parts.length == 2)
				.collect(Collectors.toMap(parts -> parts[0].trim(), parts -> parts[1].trim()));

		String audioFilePath = map.get("--audioFilePath");
		String backUpFolder = map.get("--backUpFolder");
		String uploadUrl = map.get("--uploadUrl");

		log.info("--audioFilePath = {}", audioFilePath);
		log.info("--uploadUrl = {}", uploadUrl);
		audioSenderScheduler.setFileDirectory(audioFilePath,backUpFolder,uploadUrl);

		if(Objects.nonNull(audioFilePath) && !audioFilePath.isEmpty()) {

		}
		else {
//			log.info("Audio file path is not specified.");
//			SpringApplication.exit(applicationContext, () -> 0);
		}
	}
}