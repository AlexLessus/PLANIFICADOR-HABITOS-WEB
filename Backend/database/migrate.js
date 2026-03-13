/**
 * @fileoverview Script de Migración de Base de Datos
 * Ejecuta scripts SQL de migración automáticamente
 * Uso: node migrate.js [comando]
 * Comandos: setup, seed, rollback, reset
 */

require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // Permitir múltiples statements
};

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

/**
 * Imprime mensaje con color
 */
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Lee un archivo SQL
 */
async function readSQLFile(filePath) {
    try {
        const fullPath = path.join(__dirname, filePath);
        const content = await fs.readFile(fullPath, 'utf8');
        return content;
    } catch (error) {
        throw new Error(`Error leyendo archivo ${filePath}: ${error.message}`);
    }
}

/**
 * Ejecuta un script SQL
 */
async function executeSQL(connection, sql, description) {
    try {
        log(`\n📝 Ejecutando: ${description}...`, 'cyan');
        await connection.query(sql);
        log(`✅ ${description} completado exitosamente`, 'green');
        return true;
    } catch (error) {
        log(`❌ Error en ${description}: ${error.message}`, 'red');
        throw error;
    }
}

/**
 * Comando: setup
 * Crea el schema completo de la base de datos
 */
async function setup() {
    let connection;
    try {
        log('\n🚀 Iniciando configuración de base de datos...', 'blue');
        
        connection = await mysql.createConnection(dbConfig);
        
        // Leer y ejecutar schema.sql
        const schemaSql = await readSQLFile('schema.sql');
        await executeSQL(connection, schemaSql, 'Creación de schema');
        
        log('\n✨ Base de datos configurada exitosamente', 'green');
        log('📊 Tablas creadas: users, tasks, habits, habit_completions', 'green');
        
    } catch (error) {
        log(`\n💥 Error durante setup: ${error.message}`, 'red');
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

/**
 * Comando: seed
 * Inserta datos de prueba en la base de datos
 */
async function seed() {
    let connection;
    try {
        log('\n🌱 Insertando datos de prueba...', 'blue');
        
        connection = await mysql.createConnection({
            ...dbConfig,
            database: process.env.DB_NAME || 'planner_db'
        });
        
        // Leer y ejecutar seed.sql
        const seedSql = await readSQLFile('seed.sql');
        await executeSQL(connection, seedSql, 'Inserción de datos de prueba');
        
        log('\n✨ Datos de prueba insertados exitosamente', 'green');
        log('👤 Usuario de prueba: test@test.com / Password123', 'yellow');
        
    } catch (error) {
        log(`\n💥 Error durante seed: ${error.message}`, 'red');
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

/**
 * Comando: rollback
 * Revierte la última migración
 */
async function rollback() {
    let connection;
    try {
        log('\n⏪ Revirtiendo migración...', 'blue');
        log('⚠️  ADVERTENCIA: Esto eliminará todas las tablas y datos', 'yellow');
        
        connection = await mysql.createConnection({
            ...dbConfig,
            database: process.env.DB_NAME || 'planner_db'
        });
        
        // Leer y ejecutar rollback
        const rollbackSql = await readSQLFile('rollback/001_rollback_initial_schema.sql');
        await executeSQL(connection, rollbackSql, 'Rollback de schema');
        
        log('\n✅ Rollback completado', 'green');
        
    } catch (error) {
        log(`\n💥 Error durante rollback: ${error.message}`, 'red');
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

/**
 * Comando: reset
 * Elimina todo y recrea desde cero (setup + seed)
 */
async function reset() {
    log('\n🔄 Reiniciando base de datos...', 'blue');
    log('⚠️  ADVERTENCIA: Esto eliminará TODOS los datos', 'yellow');
    
    await rollback();
    await setup();
    await seed();
    
    log('\n✨ Base de datos reiniciada completamente', 'green');
}

/**
 * Comando: status
 * Muestra el estado actual de la base de datos
 */
async function status() {
    let connection;
    try {
        log('\n📊 Estado de la base de datos...', 'blue');
        
        connection = await mysql.createConnection({
            ...dbConfig,
            database: process.env.DB_NAME || 'planner_db'
        });
        
        // Verificar tablas
        const [tables] = await connection.query('SHOW TABLES');
        log(`\n✅ Base de datos: ${process.env.DB_NAME || 'planner_db'}`, 'green');
        log(`📋 Tablas encontradas: ${tables.length}`, 'cyan');
        
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            log(`   - ${tableName}: ${count[0].count} registros`, 'cyan');
        }
        
    } catch (error) {
        log(`\n❌ Error verificando estado: ${error.message}`, 'red');
        log('💡 Tip: Ejecuta "node migrate.js setup" para crear la base de datos', 'yellow');
    } finally {
        if (connection) await connection.end();
    }
}

/**
 * Muestra ayuda de comandos
 */
function showHelp() {
    log('\n📚 Script de Migración de Base de Datos', 'blue');
    log('\nUso: node migrate.js [comando]\n', 'cyan');
    log('Comandos disponibles:', 'yellow');
    log('  setup     - Crea el schema completo de la base de datos', 'cyan');
    log('  seed      - Inserta datos de prueba (solo desarrollo)', 'cyan');
    log('  rollback  - Revierte la última migración', 'cyan');
    log('  reset     - Elimina todo y recrea desde cero (setup + seed)', 'cyan');
    log('  status    - Muestra el estado actual de la base de datos', 'cyan');
    log('  help      - Muestra esta ayuda\n', 'cyan');
    log('Ejemplos:', 'yellow');
    log('  node migrate.js setup', 'green');
    log('  node migrate.js seed', 'green');
    log('  node migrate.js reset\n', 'green');
}

/**
 * Función principal
 */
async function main() {
    const command = process.argv[2];
    
    // Verificar variables de entorno
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
        log('\n⚠️  Variables de entorno no configuradas', 'yellow');
        log('Asegúrate de tener un archivo .env con:', 'yellow');
        log('  DB_HOST=localhost', 'cyan');
        log('  DB_USER=root', 'cyan');
        log('  DB_PASSWORD=tu_password', 'cyan');
        log('  DB_NAME=planner_db\n', 'cyan');
    }
    
    switch (command) {
        case 'setup':
            await setup();
            break;
        case 'seed':
            await seed();
            break;
        case 'rollback':
            await rollback();
            break;
        case 'reset':
            await reset();
            break;
        case 'status':
            await status();
            break;
        case 'help':
        case undefined:
            showHelp();
            break;
        default:
            log(`\n❌ Comando desconocido: ${command}`, 'red');
            showHelp();
            process.exit(1);
    }
}

// Ejecutar
main().catch(error => {
    log(`\n💥 Error fatal: ${error.message}`, 'red');
    process.exit(1);
});
