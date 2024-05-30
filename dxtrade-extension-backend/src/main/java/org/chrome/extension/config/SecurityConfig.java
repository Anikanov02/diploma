package org.chrome.extension.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.CorsConfigurer;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder encoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        final CorsConfiguration mainConfig = new CorsConfiguration();
        mainConfig.setAllowedOrigins(List.of("https://trade.blackbull.com/", "https://dx.deriv.com/", "https://dx-demo.deriv.com/", "https://trade.gooeytrade.com/"));
        mainConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        mainConfig.addAllowedHeader("*");

        final CorsConfiguration authConfig = new CorsConfiguration();
        authConfig.setAllowedOrigins(List.of("*"));
        authConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        authConfig.addAllowedHeader("*");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

//        source.registerCorsConfiguration("/auth/**", authConfig);
        source.registerCorsConfiguration("/**", authConfig);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(CsrfConfigurer::disable)//TODO use
                //TODO here was user details service .userDetailsService(service)
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/orders/**", "/positions/**", "/healthcheck/**", "/auth/**").permitAll()
//                        .requestMatchers(
//                                "api/v1/users/get",
//                                "api/v1/users/register",
//                                "api/v1/users/roles",
//                                "api/v1/users/update/**",
//                                "api/v1/users/delete/**",
//                                "api/v1/apps/delete/**",
//                                "api/v1/ips/**").hasAuthority(UserRole.ADMIN.toString())
                        .anyRequest().authenticated()
                )
//                .httpBasic(Customizer.withDefaults())
        ;
        return http.build();
    }
}
