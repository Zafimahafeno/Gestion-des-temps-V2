package tsirionantsoa.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Appliquer à tous les endpoints sous /api
                .allowedOrigins("http://localhost:5173") // 👈 VOTRE FRONTEND
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Autoriser ces méthodes
                .allowedHeaders("*"); // Autoriser tous les headers
    }
}