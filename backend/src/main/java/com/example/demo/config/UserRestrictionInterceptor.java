package com.example.demo.config;

import com.example.demo.model.AppUser;
import com.example.demo.repository.AppUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class UserRestrictionInterceptor implements HandlerInterceptor {

    @Autowired
    private AppUserRepository appUserRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) auth.getPrincipal();
            String email = jwt.getClaimAsString("email");
            if (email != null) {
                AppUser user = appUserRepository.findById(email).orElse(null);
                if (user == null) {
                    user = new AppUser();
                    user.setEmail(email);
                    user.setRestricted(false);
                    if ("rajneeshv525@gmail.com".equals(email)) {
                        user.setRole("GLOBAL_ADMIN");
                    } else {
                        user.setRole("USER");
                    }
                    appUserRepository.save(user);
                }
                
                if (user.isRestricted()) {
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Account Suspended");
                    return false;
                }
            }
        }
        return true;
    }
}
