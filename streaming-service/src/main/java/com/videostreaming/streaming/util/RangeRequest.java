package com.videostreaming.streaming.util;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RangeRequest {
    private long start;
    private long end;
    private long fileSize;
    
    public long getContentLength() {
        return end - start + 1;
    }
    
    public String getContentRangeHeader() {
        return String.format("bytes %d-%d/%d", start, end, fileSize);
    }
    
    public static class RangeRequestBuilder {
        private long fileSize;
        private long start = 0;
        private long end;
        
        public RangeRequestBuilder(long fileSize) {
            this.fileSize = fileSize;
            this.end = fileSize - 1;
        }
        
        public RangeRequestBuilder withRange(String rangeHeader) {
            if (rangeHeader == null || !rangeHeader.startsWith("bytes=")) {
                return this;
            }
            
            String range = rangeHeader.substring(6);
            String[] parts = range.split("-");
            
            try {
                if (parts[0].isEmpty()) {
                    // Suffix range: -500 means last 500 bytes
                    long suffixLength = Long.parseLong(parts[1]);
                    this.start = Math.max(0, fileSize - suffixLength);
                } else {
                    this.start = Long.parseLong(parts[0]);
                    
                    if (parts.length > 1 && !parts[1].isEmpty()) {
                        this.end = Long.parseLong(parts[1]);
                    }
                }
                
                // Validate the range
                if (this.start > this.end || this.start >= fileSize) {
                    this.start = 0;
                    this.end = fileSize - 1;
                } else if (this.end >= fileSize) {
                    this.end = fileSize - 1;
                }
            } catch (NumberFormatException e) {
                this.start = 0;
                this.end = fileSize - 1;
            }
            
            return this;
        }
        
        public RangeRequest build() {
            return new RangeRequest(start, end, fileSize);
        }
    }
    
    public static RangeRequestBuilder builder(long fileSize) {
        return new RangeRequestBuilder(fileSize);
    }
}

