/**
 * Script de prueba para verificar los endpoints del calendario
 */

const BASE_URL = 'http://localhost:5000';

// Simula un token JWT válido (debes reemplazarlo con uno real de tu sistema)
const TEST_TOKEN = 'TU_TOKEN_AQUI';

async function testCalendarEndpoints() {
    console.log('🧪 Iniciando pruebas de endpoints del calendario...\n');

    // Test 1: Obtener tareas
    console.log('📋 Test 1: GET /api/tasks');
    try {
        const tasksResponse = await fetch(`${BASE_URL}/api/tasks`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
        
        if (tasksResponse.ok) {
            const tasks = await tasksResponse.json();
            console.log(`✅ Tareas obtenidas: ${tasks.length} tareas`);
            console.log('Ejemplo:', tasks[0] || 'No hay tareas');
        } else {
            console.log(`❌ Error: ${tasksResponse.status} - ${tasksResponse.statusText}`);
        }
    } catch (error) {
        console.log(`❌ Error de conexión: ${error.message}`);
    }

    console.log('\n---\n');

    // Test 2: Obtener hábitos completados
    console.log('✅ Test 2: GET /api/habits/completions');
    try {
        const habitsResponse = await fetch(`${BASE_URL}/api/habits/completions`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
        
        if (habitsResponse.ok) {
            const completions = await habitsResponse.json();
            console.log(`✅ Hábitos completados: ${completions.length} registros`);
            console.log('Ejemplo:', completions[0] || 'No hay completados');
        } else {
            console.log(`❌ Error: ${habitsResponse.status} - ${habitsResponse.statusText}`);
        }
    } catch (error) {
        console.log(`❌ Error de conexión: ${error.message}`);
    }

    console.log('\n---\n');

    // Test 3: Obtener todos los hábitos
    console.log('🏃 Test 3: GET /api/habits');
    try {
        const allHabitsResponse = await fetch(`${BASE_URL}/api/habits`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
        
        if (allHabitsResponse.ok) {
            const habits = await allHabitsResponse.json();
            console.log(`✅ Hábitos obtenidos: ${habits.length} hábitos`);
            console.log('Ejemplo:', habits[0] || 'No hay hábitos');
        } else {
            console.log(`❌ Error: ${allHabitsResponse.status} - ${allHabitsResponse.statusText}`);
        }
    } catch (error) {
        console.log(`❌ Error de conexión: ${error.message}`);
    }

    console.log('\n✨ Pruebas completadas\n');
}

// Ejecutar pruebas
testCalendarEndpoints();
