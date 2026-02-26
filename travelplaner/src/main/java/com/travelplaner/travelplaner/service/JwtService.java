package com.travelplaner.travelplaner.service;

import com.travelplaner.travelplaner.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET_KEY =
            "your_super_secret_key_which_is_at_least_32_characters";

    private SecretKey key;

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // ── Generate Token ────────────────────────────────────────────────────────

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
            .claims(extraClaims)                          // ✅ 0.12.x
            .subject(userDetails.getUsername())
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24)) // 24h
            .signWith(key)
            .compact();
    }

    // ── Extract Username ──────────────────────────────────────────────────────

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // ── Extract User ID ───────────────────────────────────────────────────────

    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);

        // First try: userId stored as a claim in token
        Object userId = claims.get("userId");
        if (userId != null) return Long.parseLong(userId.toString());

        // Fallback: look up by email from DB
        String username = claims.getSubject();
        return userRepository.findByEmail(username)
                .map(user -> user.getId())
                .orElse(null);
    }

    // ── Validate Token ────────────────────────────────────────────────────────

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()                              // ✅ not parserBuilder()
            .verifyWith(key)                              // ✅ not setSigningKey()
            .build()
            .parseSignedClaims(token)                    // ✅ not parseClaimsJws()
            .getPayload();                               // ✅ not getBody()
    }
}