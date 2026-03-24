package com.paiagent.service;

import com.paiagent.config.MinioConfig;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    /**
     * 上传字节数组到 MinIO，返回公开访问 URL
     */
    public String upload(String objectName, byte[] data, String contentType) {
        try {
            String bucket = minioConfig.getBucketName();

            // 确保 bucket 存在
            if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build())) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                log.info("Created MinIO bucket: {}", bucket);
            }

            // 上传
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .stream(new ByteArrayInputStream(data), data.length, -1)
                    .contentType(contentType)
                    .build());

            String url = minioConfig.getPublicUrl() + "/" + bucket + "/" + objectName;
            log.info("Uploaded to MinIO: {}", url);
            return url;

        } catch (Exception e) {
            log.error("MinIO upload failed: {}", e.getMessage(), e);
            throw new RuntimeException("MinIO upload failed: " + e.getMessage(), e);
        }
    }
}
