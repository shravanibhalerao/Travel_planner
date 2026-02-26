package com.travelplaner.travelplaner.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Clients subscribe to /topic/... and /user/queue/...
        registry.enableSimpleBroker("/topic", "/queue");
        // Messages sent from client go to /app/...
        registry.setApplicationDestinationPrefixes("/app");
        // For user-specific messaging
        registry.setUserDestinationPrefix("/user");
    }
}