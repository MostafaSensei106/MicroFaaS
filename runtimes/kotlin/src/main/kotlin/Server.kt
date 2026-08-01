import com.sun.net.httpserver.HttpServer
import com.sun.net.httpserver.HttpHandler
import com.sun.net.httpserver.HttpExchange
import java.net.InetSocketAddress
import java.io.InputStreamReader
import java.io.BufferedReader

fun main() {
    val port = System.getenv("PORT")?.toIntOrNull() ?: 8080
    val server = HttpServer.create(InetSocketAddress(port), 0)

    server.createContext("/") { exchange ->
        if (exchange.requestMethod != "POST") {
            val response = """{"success":false,"error":"Method Not Allowed"}"""
            exchange.sendResponseHeaders(405, response.length.toLong())
            exchange.responseBody.use { it.write(response.toByteArray()) }
            return@createContext
        }

        try {
            val body = BufferedReader(InputStreamReader(exchange.requestBody)).readText()
            
            val result = handleEvent(body)
            val response = """{"success":true,"result":$result}"""

            exchange.responseHeaders.set("Content-Type", "application/json")
            exchange.sendResponseHeaders(200, response.length.toLong())
            exchange.responseBody.use { it.write(response.toByteArray()) }
        } catch (e: Exception) {
            val errorResponse = """{"success":false,"error":"${e.message}"}"""
            exchange.responseHeaders.set("Content-Type", "application/json")
            exchange.sendResponseHeaders(500, errorResponse.length.toLong())
            exchange.responseBody.use { it.write(errorResponse.toByteArray()) }
        }
    }

    println("Kotlin 2.0 Runtime listening on port $port...")
    server.start()
}