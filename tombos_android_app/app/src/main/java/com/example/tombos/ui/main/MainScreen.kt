package com.example.tombos.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.tombos.theme.TombOSTheme

@Composable
fun MainScreen(
  onItemClick: (any) -> Unit = {},
  modifier: Modifier = Modifier,
) {
  var pairCode by remember { mutableStateOf("") }
  var isLinked by remember { mutableStateOf(false) }
  var commandInput by remember { mutableStateOf("") }
  var outputLogs by remember { mutableStateOf(listOf<String>()) }

  Column(
    modifier = modifier
      .fillMaxSize()
      .background(MaterialTheme.colorScheme.background)
      .padding(16.dp)
      .verticalScroll(rememberScrollState()),
    horizontalAlignment = Alignment.CenterHorizontally
  ) {
    Text(
      text = "🐢 Turtle OS Mobile Link",
      fontSize = 20.sp,
      fontWeight = FontWeight.Bold,
      color = MaterialTheme.colorScheme.primary,
      modifier = Modifier.padding(bottom = 16.dp)
    )

    // Pairing Section
    Card(
      modifier = Modifier
        .fillMaxWidth()
        .padding(bottom = 16.dp),
      colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
      Column(modifier = Modifier.padding(16.dp)) {
        Text(
          text = "Pairing Configuration",
          fontWeight = FontWeight.SemiBold,
          fontSize = 14.sp,
          color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
          text = "Pair Status: ${if (isLinked) "CONNECTED" else "DISCONNECTED"}",
          fontSize = 12.sp,
          color = if (isLinked) Color.Green else Color.Red,
          fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(12.dp))

        if (!isLinked) {
          OutlinedTextField(
            value = pairCode,
            onValueChange = { pairCode = it },
            label = { Text("Pair Code (e.g. TURTLE-789-SEC)") },
            modifier = Modifier.fillMaxWidth()
          )
          Spacer(modifier = Modifier.height(12.dp))
          Button(
            onClick = {
              if (pairCode.trim() == "TURTLE-789-SEC") {
                isLinked = true
                outputLogs = outputLogs + "Link successful with credentials."
              } else {
                outputLogs = outputLogs + "Pairing failed: Invalid pair code."
              }
            },
            modifier = Modifier.fillMaxWidth()
          ) {
            Text("Link Mobile to Desktop")
          }
        } else {
          Button(
            onClick = {
              isLinked = false
              pairCode = ""
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
            modifier = Modifier.fillMaxWidth()
          ) {
            Text("Unpair Device", color = Color.White)
          }
        }
      }
    }

    // System Analytics Dashboard Card
    Card(
      modifier = Modifier
        .fillMaxWidth()
        .padding(bottom = 16.dp),
      colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
      Column(modifier = Modifier.padding(16.dp)) {
        Text(
          text = "📊 System Analytics Dashboard",
          fontWeight = FontWeight.SemiBold,
          fontSize = 14.sp,
          color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(12.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
          Column {
            Text("Security Score", fontSize = 10.sp, color = Color.Gray)
            Text("94% (STRICT)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
          }
          Column {
            Text("Kyber Shield", fontSize = 10.sp, color = Color.Gray)
            Text("99.8% Stable", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.Green)
          }
          Column {
            Text("Egress Tunnel", fontSize = 10.sp, color = Color.Gray)
            Text("Active VPN", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
          }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
          Column {
            Text("Microkernel", fontSize = 10.sp, color = Color.Gray)
            Text("seL4 Verified", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.Green)
          }
          Column {
            Text("Threat Filter", fontSize = 10.sp, color = Color.Gray)
            Text("AppArmor active", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.Green)
          }
          Column {
            Text("Compliance", fontSize = 10.sp, color = Color.Gray)
            Text("SOC 2 Audited", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
          }
        }

        Spacer(modifier = Modifier.height(12.dp))
        
        Text("CPU Auditing Load: 18%", fontSize = 10.sp, color = Color.Gray)
        LinearProgressIndicator(
          progress = { 0.18f },
          modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
          color = MaterialTheme.colorScheme.primary
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text("Memory Capacity: 4096MB seL4 Pages", fontSize = 10.sp, color = Color.Gray)
        LinearProgressIndicator(
          progress = { 0.42f },
          modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
          color = MaterialTheme.colorScheme.primary
        )
      }
    }

    // Command Dispatcher Section
    if (isLinked) {
      Card(
        modifier = Modifier
          .fillMaxWidth()
          .padding(bottom = 16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
      ) {
        Column(modifier = Modifier.padding(16.dp)) {
          Text(
            text = "Remote Command console",
            fontWeight = FontWeight.SemiBold,
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.primary
          )
          Spacer(modifier = Modifier.height(8.dp))
          OutlinedTextField(
            value = commandInput,
            onValueChange = { commandInput = it },
            label = { Text("Command (e.g. system status)") },
            modifier = Modifier.fillMaxWidth()
          )
          Spacer(modifier = Modifier.height(12.dp))
          Button(
            onClick = {
              if (commandInput.isNotBlank()) {
                outputLogs = outputLogs + "📱 Sent from phone: \"$commandInput\""
                commandInput = ""
              }
            },
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
            modifier = Modifier.fillMaxWidth()
          ) {
            Text("Send Command to Desktop")
          }
        }
      }
    }

    // Egress Logs
    Card(
      modifier = Modifier.fillMaxWidth(),
      colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
      Column(modifier = Modifier.padding(16.dp)) {
        Text(
          text = "Local Egress stream",
          fontWeight = FontWeight.SemiBold,
          fontSize = 14.sp,
          color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(8.dp))
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .background(Color.Black)
            .padding(8.dp)
        ) {
          if (outputLogs.isEmpty()) {
            Text(
              text = "No log payloads yet.",
              color = Color.LightGray,
              fontFamily = FontFamily.Monospace,
              fontSize = 10.sp
            )
          } else {
            outputLogs.forEach { log ->
              Text(
                text = log,
                color = Color.Green,
                fontFamily = FontFamily.Monospace,
                fontSize = 10.sp
              )
            }
          }
        }
      }
    }
  }
}

@Preview(showBackground = true)
@Composable
fun MainScreenPreview() {
  TombOSTheme { MainScreen() }
}
