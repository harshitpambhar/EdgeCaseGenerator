package com.microservices.repo_analysis_service.util;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class FileScanner {

    private static final Set<String> LANGUAGE_EXTENSIONS = Set.of(
            "java", "js", "jsx", "ts", "tsx", "py", "go", "rb", "php", "cs",
            "cpp", "c", "h", "swift", "kt", "scala", "clj", "rust", "r"
    );

    private static final Set<String> CONFIG_FILES = Set.of(
            "pom.xml", "build.gradle", "package.json", "requirements.txt",
            "go.mod", "Gemfile", "Cargo.toml", "composer.json", ".env",
            "application.yml", "application.properties", "settings.gradle",
            ".gitignore", "dockerfile", "docker-compose.yml", "nginx.conf"
    );

    private static final Set<String> TEST_INDICATORS = Set.of(
            "test", "spec", "__test__", "test.js", "test.ts", ".test.",
            ".spec.", "jest.config", "karma.conf", "mocha", "vitest"
    );

    public static Map<String, Object> scanRepository(Path repoPath) throws Exception {
        Map<String, Object> analysis = new HashMap<>();

        List<String> allFiles = new ArrayList<>();
        List<String> directories = new ArrayList<>();
        Map<String, Integer> fileTypeDistribution = new HashMap<>();
        Set<String> detectedLanguages = new HashSet<>();
        int fileCount = 0;
        int directoryCount = 0;

        Files.walk(repoPath)
                .filter(path -> !path.toString().contains(".git"))
                .filter(path -> !path.toString().contains("node_modules"))
                .filter(path -> !path.toString().contains(".gradle"))
                .filter(path -> !path.toString().contains("target"))
                .filter(path -> !path.toString().contains(".mvn"))
                .filter(path -> !path.toString().contains(".venv"))
                .filter(path -> !path.toString().contains("__pycache__"))
                .filter(path -> !path.toString().contains(".idea"))
                .forEach(path -> {
                    File file = path.toFile();
                    String relativePath = repoPath.relativize(path).toString();

                    if (file.isDirectory() && !relativePath.isEmpty()) {
                        directories.add(relativePath);
                    } else if (file.isFile()) {
                        allFiles.add(relativePath);
                        String extension = getFileExtension(file.getName());
                        fileTypeDistribution.merge(extension, 1, Integer::sum);

                        if (LANGUAGE_EXTENSIONS.contains(extension)) {
                            detectedLanguages.add(mapExtensionToLanguage(extension));
                        }
                    }
                });

        fileCount = allFiles.size();
        directoryCount = directories.size();

        analysis.put("fileCount", fileCount);
        analysis.put("directoryCount", directoryCount);
        analysis.put("directories", directories.stream().limit(20).collect(Collectors.toList()));
        analysis.put("fileTypeDistribution", fileTypeDistribution);
        analysis.put("detectedLanguages", detectedLanguages);
        analysis.put("allFiles", allFiles);

        return analysis;
    }

    public static Set<String> detectLanguages(Path repoPath, List<String> files) {
        Set<String> languages = new HashSet<>();

        for (String file : files) {
            String ext = getFileExtension(file);
            if (LANGUAGE_EXTENSIONS.contains(ext)) {
                languages.add(mapExtensionToLanguage(ext));
            }
        }

        return languages;
    }

    public static Set<String> detectFrameworks(Path repoPath, List<String> files) {
        Set<String> frameworks = new HashSet<>();

        for (String file : files) {
            String name = file.toLowerCase();

            if (name.contains("pom.xml")) {
                frameworks.add("Spring Boot");
            }
            if (name.contains("package.json")) {
                try {
                    String content = Files.readString(repoPath.resolve(file));
                    if (content.contains("react")) {
                        frameworks.add("React");
                    }
                    if (content.contains("vue")) {
                        frameworks.add("Vue.js");
                    }
                    if (content.contains("angular")) {
                        frameworks.add("Angular");
                    }
                    if (content.contains("next")) {
                        frameworks.add("Next.js");
                    }
                    if (content.contains("express")) {
                        frameworks.add("Express.js");
                    }
                    if (content.contains("django")) {
                        frameworks.add("Django");
                    }
                    if (content.contains("fastapi")) {
                        frameworks.add("FastAPI");
                    }
                } catch (Exception e) {
                    // Silently continue
                }
            }
            if (name.contains("requirements.txt")) {
                frameworks.add("Python");
            }
            if (name.contains("go.mod")) {
                frameworks.add("Go");
            }
            if (name.contains("cargo.toml")) {
                frameworks.add("Rust");
            }
        }

        return frameworks;
    }

    public static String detectBuildTool(List<String> files) {
        for (String file : files) {
            String name = file.toLowerCase();
            if (name.contains("pom.xml")) {
                return "Maven";
            }
            if (name.contains("build.gradle")) {
                return "Gradle";
            }
            if (name.contains("package.json")) {
                return "npm/yarn";
            }
            if (name.contains("go.mod")) {
                return "Go Modules";
            }
            if (name.contains("cargo.toml")) {
                return "Cargo";
            }
            if (name.contains("requirements.txt")) {
                return "pip";
            }
        }
        return "Unknown";
    }

    public static String detectTestFramework(List<String> files) {
        for (String file : files) {
            String name = file.toLowerCase();
            if (name.contains("pom.xml")) {
                return "JUnit";
            }
            if (name.contains("jest.config")) {
                return "Jest";
            }
            if (name.contains("karma.conf")) {
                return "Karma";
            }
            if (name.contains("mocha")) {
                return "Mocha";
            }
            if (name.contains("pytest.ini")) {
                return "pytest";
            }
            if (name.contains("vitest")) {
                return "Vitest";
            }
        }

        // Check in directories
        for (String file : files) {
            if (file.contains("test") || file.contains("spec")) {
                if (file.endsWith(".java")) {
                    return "JUnit";
                }
                if (file.endsWith(".js") || file.endsWith(".ts")) {
                    return "Jest";
                }
                if (file.endsWith(".py")) {
                    return "pytest";
                }
            }
        }

        return "Unknown";
    }

    public static List<String> detectRiskAreas(Path repoPath, Set<String> languages, List<String> files) {
        List<String> risks = new ArrayList<>();

        long testFiles = files.stream()
                .filter(f -> TEST_INDICATORS.stream().anyMatch(f.toLowerCase()::contains))
                .count();

        if (testFiles == 0) {
            risks.add("No test files detected");
        }

        if (testFiles < files.size() * 0.2) {
            risks.add("Test coverage appears low (< 20% test files)");
        }

        if (languages.contains("Java") && !files.stream().anyMatch(f -> f.contains("integration"))) {
            risks.add("No integration tests found");
        }

        if (!files.stream().anyMatch(f -> f.toLowerCase().contains("dockerfile"))) {
            risks.add("No Docker configuration found");
        }

        if (!files.stream().anyMatch(f -> f.toLowerCase().contains("readme"))) {
            risks.add("No README documentation found");
        }

        return risks;
    }

    public static List<String> generateRecommendations(Set<String> languages, String buildTool, List<String> risks) {
        List<String> recommendations = new ArrayList<>();

        if (languages.contains("Java")) {
            recommendations.add("Generate unit tests for service layer");
            recommendations.add("Generate integration tests for REST endpoints");
            recommendations.add("Generate repository/DAO layer tests");
        }

        if (languages.contains("JavaScript") || languages.contains("TypeScript")) {
            recommendations.add("Generate Jest unit tests");
            recommendations.add("Generate React component tests");
            recommendations.add("Generate API integration tests");
        }

        if (risks.contains("Test coverage appears low (< 20% test files)")) {
            recommendations.add("Priority: Increase test coverage");
        }

        if (risks.contains("No integration tests found")) {
            recommendations.add("Add integration test suite");
        }

        recommendations.add("Setup CI/CD pipeline");

        return recommendations;
    }

    private static String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : "unknown";
    }

    private static String mapExtensionToLanguage(String ext) {
        return switch (ext) {
            case "java" ->
                "Java";
            case "js" ->
                "JavaScript";
            case "jsx" ->
                "JavaScript";
            case "ts" ->
                "TypeScript";
            case "tsx" ->
                "TypeScript";
            case "py" ->
                "Python";
            case "go" ->
                "Go";
            case "rb" ->
                "Ruby";
            case "php" ->
                "PHP";
            case "cs" ->
                "C#";
            case "cpp", "c", "h" ->
                "C/C++";
            case "swift" ->
                "Swift";
            case "kt" ->
                "Kotlin";
            case "scala" ->
                "Scala";
            case "clj" ->
                "Clojure";
            case "rust" ->
                "Rust";
            case "r" ->
                "R";
            default ->
                "Other";
        };
    }

}
