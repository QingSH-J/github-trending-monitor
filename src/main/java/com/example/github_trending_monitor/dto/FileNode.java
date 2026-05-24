package com.example.github_trending_monitor.dto;

import java.util.List;

public record FileNode(String name, String type, List<FileNode> children){}