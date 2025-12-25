package com.clarity.clarity.config;

import org.springframework.boot.sql.init.dependency.DependsOnDatabaseInitialization;
import org.springframework.context.annotation.Configuration;

@Configuration
@DependsOnDatabaseInitialization
public class FlywayConfig {

}
