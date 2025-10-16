package tsirionantsoa.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuration de sécurité pour désactiver temporairement la protection CSRF
 * et autoriser toutes les requêtes (pour le développement REST sans JWT).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Désactive la protection CSRF (utile pour les API REST stateless)
            .csrf(AbstractHttpConfigurer::disable)
            // Configure CORS pour utiliser la configuration @Bean ci-dessous
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Autorise toutes les requêtes entrantes sans authentification
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        return http.build();
    }

    /**
     * Configuration CORS globale pour autoriser l'accès depuis le port React (5173)
     * Changement temporaire: utilisation de "*" pour le débogage CORS.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // CHANGEMENT ICI: Utilisation de "*" pour l'origine, ce qui devrait TOUJOURS fonctionner pour les tests locaux.
        configuration.setAllowedOrigins(Arrays.asList("*")); 
        // Permet les méthodes POST, GET, PUT, DELETE, etc.
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Autorise tous les headers
        configuration.setAllowedHeaders(Arrays.asList("*")); 
        // Désactivation des credentials lorsque l'origine est "*".
        configuration.setAllowCredentials(false); 

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Applique cette configuration à toutes les routes (/**)
        source.registerCorsConfiguration("/**", configuration); 
        return source;
    }
}
