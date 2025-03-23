#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::Command;

#[derive(serde::Serialize)]
struct ShellResult {
    success: bool,
    stdout: String,
    stderr: String,
    code: i32,
    error: Option<String>,
}

#[derive(serde::Serialize)]
struct ProcessResult {
    success: bool,
    processes: Vec<String>,
    error: Option<String>,
}

// Execute shell command
#[tauri::command]
fn execute_shell_command(command: String) -> ShellResult {
    let os = std::env::consts::OS;
    
    let (program, args) = if os == "windows" {
        ("cmd", vec!["/C", &command])
    } else {
        ("sh", vec!["-c", &command])
    };
    
    match Command::new(program).args(args).output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            let code = output.status.code().unwrap_or(-1);
            
            ShellResult {
                success: output.status.success(),
                stdout,
                stderr,
                code,
                error: None,
            }
        },
        Err(e) => ShellResult {
            success: false,
            stdout: String::new(),
            stderr: String::new(),
            code: -1,
            error: Some(e.to_string()),
        },
    }
}

// Detect running processes
#[tauri::command]
fn detect_processes(process_names: Vec<String>) -> ProcessResult {
    let os = std::env::consts::OS;
    
    let (program, args, pattern_fn): (&str, Vec<String>, Box<dyn Fn(&str, &str) -> bool>) = match os {
        "windows" => {
            let process_filters = process_names.iter()
                .map(|p| format!("IMAGENAME eq {}", p))
                .collect::<Vec<_>>()
                .join(" || ");
            
            let command = format!("tasklist /FI \"{}\" /NH", process_filters);
            let args = vec!["/C".to_string(), command];
            
            (
                "cmd", 
                args,
                Box::new(|output: &str, process: &str| {
                    output.to_lowercase().contains(&process.to_lowercase())
                })
            )
        },
        "macos" | "linux" => {
            let process_pattern = process_names.join("|");
            let command = format!("ps aux | grep -E \"{}\" | grep -v grep", process_pattern);
            let args = vec!["-c".to_string(), command];
            
            (
                "sh", 
                args,
                Box::new(|output: &str, process: &str| {
                    output.contains(&format!(" {} ", process)) || 
                    output.contains(&format!("/{}", process))
                })
            )
        },
        _ => {
            return ProcessResult {
                success: false,
                processes: vec![],
                error: Some("Unsupported operating system".to_string()),
            };
        }
    };
    
    match Command::new(program).args(&args).output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            
            let running_processes = process_names.iter()
                .filter(|&proc| pattern_fn(&stdout, proc))
                .cloned()
                .collect();
            
            ProcessResult {
                success: true,
                processes: running_processes,
                error: None,
            }
        },
        Err(e) => ProcessResult {
            success: false,
            processes: vec![],
            error: Some(e.to_string()),
        },
    }
}

// Kill processes
#[tauri::command]
fn kill_processes(process_names: Vec<String>) -> ShellResult {
    let os = std::env::consts::OS;
    
    let (program, args) = match os {
        "windows" => {
            let process_args = process_names.iter()
                .map(|p| format!("/IM {}", p))
                .collect::<Vec<_>>()
                .join(" ");
            
            let command = format!("taskkill /F {}", process_args);
            ("cmd", vec!["/C".to_string(), command])
        },
        "macos" | "linux" => {
            let processes = process_names.join(" ");
            let command = format!("killall {}", processes);
            ("sh", vec!["-c".to_string(), command])
        },
        _ => {
            return ShellResult {
                success: false,
                stdout: String::new(),
                stderr: String::new(),
                code: -1,
                error: Some("Unsupported operating system".to_string()),
            };
        }
    };
    
    match Command::new(program).args(&args).output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            let code = output.status.code().unwrap_or(-1);
            
            ShellResult {
                success: output.status.success(),
                stdout,
                stderr,
                code,
                error: None,
            }
        },
        Err(e) => ShellResult {
            success: false,
            stdout: String::new(),
            stderr: String::new(),
            code: -1,
            error: Some(e.to_string()),
        },
    }
}

// Open application
#[tauri::command]
fn open_application(app_name: String) -> ShellResult {
    let os = std::env::consts::OS;
    
    let (program, args) = match os {
        "windows" => {
            let command = format!("start \"\" \"{}\"", app_name);
            ("cmd", vec!["/C".to_string(), command])
        },
        "macos" => {
            let command = format!("open -a \"{}\"", app_name);
            ("sh", vec!["-c".to_string(), command])
        },
        "linux" => {
            let command = format!("{} &", app_name);
            ("sh", vec!["-c".to_string(), command])
        },
        _ => {
            return ShellResult {
                success: false,
                stdout: String::new(),
                stderr: String::new(),
                code: -1,
                error: Some("Unsupported operating system".to_string()),
            };
        }
    };
    
    match Command::new(program).args(&args).output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            let code = output.status.code().unwrap_or(-1);
            
            ShellResult {
                success: output.status.success(),
                stdout,
                stderr,
                code,
                error: None,
            }
        },
        Err(e) => ShellResult {
            success: false,
            stdout: String::new(),
            stderr: String::new(),
            code: -1,
            error: Some(e.to_string()),
        },
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            execute_shell_command,
            detect_processes,
            kill_processes,
            open_application,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

