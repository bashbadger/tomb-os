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
  var apiEndpoint by remember { mutableStateOf("https://turtle-secure.sec/api") }
  var apiKey by remember { mutableStateOf("") }
  var isLinked by remember { mutableStateOf(false) }
  var selectedTab by remember { mutableStateOf("analytics") }
  var isBiometricAuthenticated by remember { mutableStateOf(false) }
  var isPinAuthenticated by remember { mutableStateOf(false) }
  var pinInput by remember { mutableStateOf("") }
  
  // Terminal states
  var commandInput by remember { mutableStateOf("") }
  var outputLogs by remember { mutableStateOf(listOf<String>()) }
  
  // Chat states
  var chatInput by remember { mutableStateOf("") }
  var chatMessages by remember { mutableStateOf(listOf("[Sec-Admin] E2EE post-quantum Kyber lattice channel initialized.")) }
  var chatCredits by remember { mutableStateOf(50) }
  
  // OpenClaw / VM states
  var catHunger by remember { mutableStateOf(100) }
  var catLives by remember { mutableStateOf(3) }
  var vmCode by remember { mutableStateOf("// write system patch code here...\nfunction verifyStack() { return true; }") }
  var vmStatus by remember { mutableStateOf("VM Status: Isolated") }
  var isVMPatchSafe by remember { mutableStateOf(false) }

  Column(
    modifier = modifier
      .fillMaxSize()
      .background(MaterialTheme.colorScheme.background)
      .padding(16.dp)
      .verticalScroll(rememberScrollState()),
    horizontalAlignment = Alignment.CenterHorizontally
  ) {
    Text(
      text = "🐢 Turtle OS Mobile Enclave",
      fontSize = 20.sp,
      fontWeight = FontWeight.Bold,
      color = MaterialTheme.colorScheme.primary,
      modifier = Modifier.padding(bottom = 12.dp)
    )

    if (!isBiometricAuthenticated) {
      Card(
        modifier = Modifier
          .fillMaxWidth()
          .padding(top = 24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
      ) {
        Column(
          modifier = Modifier.padding(24.dp),
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          Text(
            text = "🔒 Biometric Scan Required",
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp,
            color = MaterialTheme.colorScheme.primary
          )
          Spacer(modifier = Modifier.height(12.dp))
          Text(
            text = "Use your phone's fingerprint scanner or Face ID credentials to unlock.",
            fontSize = 12.sp,
            color = Color.Gray
          )
          Spacer(modifier = Modifier.height(24.dp))
          Button(
            onClick = { isBiometricAuthenticated = true },
            modifier = Modifier.fillMaxWidth()
          ) {
            Text("Simulate Biometric Verification")
          }
        }
      }
    } else if (!isPinAuthenticated) {
      Card(
        modifier = Modifier
          .fillMaxWidth()
          .padding(top = 24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
      ) {
        Column(
          modifier = Modifier.padding(24.dp),
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          Text(
            text = "🔓 Enter Secure PIN",
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp,
            color = MaterialTheme.colorScheme.primary
          )
          Spacer(modifier = Modifier.height(12.dp))
          Text(
            text = "Type your individualized 4-digit security PIN to proceed.",
            fontSize = 12.sp,
            color = Color.Gray
          )
          Spacer(modifier = Modifier.height(16.dp))
          OutlinedTextField(
            value = pinInput,
            onValueChange = { pinInput = it },
            label = { Text("Individualized PIN (try 1337)") },
            modifier = Modifier.fillMaxWidth(),
            maxLines = 1
          )
          Spacer(modifier = Modifier.height(16.dp))
          Button(
            onClick = {
              if (pinInput.trim() == "1337") {
                isPinAuthenticated = true
              }
            },
            modifier = Modifier.fillMaxWidth()
          ) {
            Text("Verify PIN")
          }
        }
      }
    } else {
      // Device Link / Pairing Card (Always shown at top)
      Card(
        modifier = Modifier
          .fillMaxWidth()
          .padding(bottom = 12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
      ) {
        Column(modifier = Modifier.padding(12.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "Mobile Pairing Status",
              fontWeight = FontWeight.SemiBold,
              fontSize = 12.sp,
              color = MaterialTheme.colorScheme.primary
            )
            Text(
              text = if (isLinked) "ACTIVE" else "DISCONNECTED",
              fontSize = 11.sp,
              color = if (isLinked) Color.Green else Color.Red,
              fontWeight = FontWeight.Bold
            )
          }

          if (!isLinked) {
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
              value = apiEndpoint,
              onValueChange = { apiEndpoint = it },
              label = { Text("API Connection URL") },
              modifier = Modifier.fillMaxWidth(),
              maxLines = 1
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
              value = apiKey,
              onValueChange = { apiKey = it },
              label = { Text("API Access Key (TURTLE-789-SEC)") },
              modifier = Modifier.fillMaxWidth(),
              maxLines = 1
            )
            Spacer(modifier = Modifier.height(8.dp))
            Button(
              onClick = {
                if (apiEndpoint.isNotBlank() && apiKey.trim() == "TURTLE-789-SEC") {
                  isLinked = true
                  outputLogs = outputLogs + "Link successful to: $apiEndpoint"
                }
              },
              modifier = Modifier.fillMaxWidth()
            ) {
              Text("Link to Host OS")
            }
          } else {
            Spacer(modifier = Modifier.height(6.dp))
            Button(
              onClick = {
                isLinked = false
                apiKey = ""
              },
              colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
              modifier = Modifier.fillMaxWidth()
            ) {
              Text("Disconnect Mobile Link", color = Color.White)
            }
          }
        }
      }

      if (isLinked) {
        // One App, All Service access navigation
        ScrollableTabRow(
          selectedTabIndex = when (selectedTab) {
            "analytics" -> 0
            "messenger" -> 1
            "openclaw" -> 2
            "terminal" -> 3
            else -> 0
          },
          modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 12.dp),
          edgePadding = 0.dp
        ) {
          Tab(selected = selectedTab == "analytics", onClick = { selectedTab = "analytics" }) {
            Text("Dashboard", modifier = Modifier.padding(10.dp), fontSize = 11.sp)
          }
          Tab(selected = selectedTab == "messenger", onClick = { selectedTab = "messenger" }) {
            Text("Messenger", modifier = Modifier.padding(10.dp), fontSize = 11.sp)
          }
          Tab(selected = selectedTab == "openclaw", onClick = { selectedTab = "openclaw" }) {
            Text("OpenClaw", modifier = Modifier.padding(10.dp), fontSize = 11.sp)
          }
          Tab(selected = selectedTab == "terminal", onClick = { selectedTab = "terminal" }) {
            Text("Terminal", modifier = Modifier.padding(10.dp), fontSize = 11.sp)
          }
        }

        // Switch View Content
        when (selectedTab) {
          "analytics" -> {
            Card(
              modifier = Modifier.fillMaxWidth(),
              colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
              Column(modifier = Modifier.padding(16.dp)) {
                Text("📊 Host Analytics Dashboard", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
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

                Spacer(modifier = Modifier.height(12.dp))

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

                Spacer(modifier = Modifier.height(16.dp))
                Text("CPU Load: 18%", fontSize = 10.sp, color = Color.Gray)
                LinearProgressIndicator(progress = { 0.18f }, modifier = Modifier.fillMaxWidth().padding(top = 4.dp))

                Spacer(modifier = Modifier.height(8.dp))
                Text("Memory Pages: 42%", fontSize = 10.sp, color = Color.Gray)
                LinearProgressIndicator(progress = { 0.42f }, modifier = Modifier.fillMaxWidth().padding(top = 4.dp))
              }
            }
          }

          "messenger" -> {
            Card(
              modifier = Modifier.fillMaxWidth(),
              colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
              Column(modifier = Modifier.padding(16.dp)) {
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Text("💬 Messenger Enclave", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                  Text("Credits: $chatCredits", fontSize = 11.sp, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.height(12.dp))

                Column(
                  modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .background(Color.Black)
                    .padding(8.dp)
                    .verticalScroll(rememberScrollState())
                ) {
                  chatMessages.forEach { msg ->
                    Text(msg, color = Color.White, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                    Spacer(modifier = Modifier.height(4.dp))
                  }
                }

                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                  value = chatInput,
                  onValueChange = { chatInput = it },
                  label = { Text("Type message...") },
                  modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                  onClick = {
                    if (chatInput.isNotBlank() && chatCredits >= 10) {
                      chatMessages = chatMessages + "User: $chatInput"
                      chatCredits -= 10
                      
                      val query = chatInput.toLowerCase()
                      chatInput = ""
                      if (query.contains("status")) {
                        chatMessages = chatMessages + "Sec-Admin: Mesh status active. Firewall running."
                      } else {
                        chatMessages = chatMessages + "Sec-Admin: Message parsed securely under E2EE PQC."
                      }
                    }
                  },
                  modifier = Modifier.fillMaxWidth()
                ) {
                  Text("Send E2EE Message")
                }
              }
            }
          }

          "openclaw" -> {
            Card(
              modifier = Modifier.fillMaxWidth(),
              colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
              Column(modifier = Modifier.padding(16.dp)) {
                Text("🎮 OpenClaw & Developer Sandbox", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.height(8.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                  Text("Hunger: $catHunger%", fontSize = 11.sp, color = Color.Gray)
                  Text("Lives: $catLives", fontSize = 11.sp, color = Color.Gray)
                }
                Spacer(modifier = Modifier.height(12.dp))

                Text("Developer Sandbox Editor", fontSize = 10.sp, color = Color.Gray)
                OutlinedTextField(
                  value = vmCode,
                  onValueChange = { vmCode = it },
                  modifier = Modifier.fillMaxWidth().height(100.dp),
                  textStyle = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace)
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                Text(vmStatus, fontSize = 10.sp, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                  Button(
                    onClick = {
                      vmStatus = "Verifying stack checks in VM..."
                      if (vmCode.contains("unsafe") || vmCode.contains("eval")) {
                        vmStatus = "VERIFICATION FAILED: Unsafe code."
                        isVMPatchSafe = false
                      } else {
                        vmStatus = "VERIFICATION PASSED: Code is safe."
                        isVMPatchSafe = true
                      }
                    },
                    modifier = Modifier.weight(1f)
                  ) {
                    Text("Test Patch")
                  }
                  Button(
                    onClick = {
                      if (isVMPatchSafe) {
                        vmStatus = "Patch successfully deployed to Core."
                        isVMPatchSafe = false
                      }
                    },
                    enabled = isVMPatchSafe,
                    modifier = Modifier.weight(1f)
                  ) {
                    Text("Deploy Patch")
                  }
                }
              }
            }
          }

          "terminal" -> {
            Card(
              modifier = Modifier.fillMaxWidth(),
              colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
              Column(modifier = Modifier.padding(16.dp)) {
                Text("🖥️ Remote Command Console", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                  value = commandInput,
                  onValueChange = { commandInput = it },
                  label = { Text("Command (e.g. system status)") },
                  modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                  onClick = {
                    if (commandInput.isNotBlank()) {
                      outputLogs = outputLogs + "📱 Sent from phone: \"$commandInput\""
                      commandInput = ""
                    }
                  },
                  modifier = Modifier.fillMaxWidth()
                ) {
                  Text("Send Command to Desktop")
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                Text("Egress stream output", fontSize = 10.sp, color = Color.Gray)
                Column(
                  modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.Black)
                    .padding(8.dp)
                ) {
                  if (outputLogs.isEmpty()) {
                    Text("No logs yet.", color = Color.LightGray, fontFamily = FontFamily.Monospace, fontSize = 10.sp)
                  } else {
                    outputLogs.forEach { log ->
                      Text(log, color = Color.Green, fontFamily = FontFamily.Monospace, fontSize = 10.sp)
                    }
                  }
                }
              }
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
