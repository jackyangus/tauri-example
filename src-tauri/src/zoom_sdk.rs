#![allow(unexpected_cfgs)]

use cocoa::foundation::{NSString, NSAutoreleasePool};
use objc::runtime::{Class, Object};
use objc::{msg_send, sel, sel_impl};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ZoomSessionConfig {
    pub session_name: String,
    pub user_name: String,
    pub session_password: Option<String>,
    pub jwt_token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ZoomSDKError {
    pub code: i32,
    pub message: String,
}

// Thread-safe wrapper for the Objective-C object pointer
struct SDKInstance(*mut Object);
unsafe impl Send for SDKInstance {}
unsafe impl Sync for SDKInstance {}

pub struct ZoomSDKManager {
    sdk_instance: Option<SDKInstance>,
    is_initialized: bool,
}

impl ZoomSDKManager {
    pub fn new() -> Self {
        Self {
            sdk_instance: None,
            is_initialized: false,
        }
    }

    pub fn initialize(&mut self, domain: Option<&str>) -> Result<(), ZoomSDKError> {
        unsafe {
            let _pool = NSAutoreleasePool::new(cocoa::base::nil);
            
            // Get ZMVideoSDK class
            let sdk_class = Class::get("ZMVideoSDK").ok_or(ZoomSDKError {
                code: -1,
                message: "ZMVideoSDK class not found".to_string(),
            })?;

            // Create shared instance
            let shared_sdk: *mut Object = msg_send![sdk_class, sharedSDK];
            
            // Create initialization parameters
            let init_params_class = Class::get("ZMVideoSDKInitParams").ok_or(ZoomSDKError {
                code: -2,
                message: "ZMVideoSDKInitParams class not found".to_string(),
            })?;
            
            let init_params: *mut Object = msg_send![init_params_class, new];
            
            // Set domain if provided
            if let Some(domain_str) = domain {
                let ns_domain = NSString::alloc(cocoa::base::nil).init_str(domain_str);
                let _: () = msg_send![init_params, setDomain: ns_domain];
            }

            // Initialize SDK
            let result: i32 = msg_send![shared_sdk, initialize: init_params];
            
            if result == 0 {
                self.sdk_instance = Some(SDKInstance(shared_sdk));
                self.is_initialized = true;
                Ok(())
            } else {
                Err(ZoomSDKError {
                    code: result,
                    message: format!("SDK initialization failed with code: {}", result),
                })
            }
        }
    }

    pub fn join_session(&self, config: &ZoomSessionConfig) -> Result<(), ZoomSDKError> {
        if !self.is_initialized {
            return Err(ZoomSDKError {
                code: -3,
                message: "SDK not initialized".to_string(),
            });
        }

        unsafe {
            let _pool = NSAutoreleasePool::new(cocoa::base::nil);
            
            if let Some(SDKInstance(sdk)) = self.sdk_instance {
                // Create session context
                let session_context_class = Class::get("ZMVideoSDKSessionContext").ok_or(ZoomSDKError {
                    code: -4,
                    message: "ZMVideoSDKSessionContext class not found".to_string(),
                })?;
                
                let session_context: *mut Object = msg_send![session_context_class, new];
                
                // Set session parameters
                let ns_session_name = NSString::alloc(cocoa::base::nil).init_str(&config.session_name);
                let ns_user_name = NSString::alloc(cocoa::base::nil).init_str(&config.user_name);
                let ns_jwt_token = NSString::alloc(cocoa::base::nil).init_str(&config.jwt_token);
                
                let _: () = msg_send![session_context, setSessionName: ns_session_name];
                let _: () = msg_send![session_context, setUserName: ns_user_name];
                let _: () = msg_send![session_context, setToken: ns_jwt_token];
                
                if let Some(password) = &config.session_password {
                    let ns_password = NSString::alloc(cocoa::base::nil).init_str(password);
                    let _: () = msg_send![session_context, setSessionPassword: ns_password];
                }

                // Join session
                let result: i32 = msg_send![sdk, joinSession: session_context];
                
                if result == 0 {
                    Ok(())
                } else {
                    Err(ZoomSDKError {
                        code: result,
                        message: format!("Failed to join session with code: {}", result),
                    })
                }
            } else {
                Err(ZoomSDKError {
                    code: -5,
                    message: "SDK instance not available".to_string(),
                })
            }
        }
    }

    pub fn leave_session(&self) -> Result<(), ZoomSDKError> {
        if !self.is_initialized {
            return Err(ZoomSDKError {
                code: -3,
                message: "SDK not initialized".to_string(),
            });
        }

        unsafe {
            if let Some(SDKInstance(sdk)) = self.sdk_instance {
                let result: i32 = msg_send![sdk, leaveSession: true]; // true for end session
                
                if result == 0 {
                    Ok(())
                } else {
                    Err(ZoomSDKError {
                        code: result,
                        message: format!("Failed to leave session with code: {}", result),
                    })
                }
            } else {
                Err(ZoomSDKError {
                    code: -5,
                    message: "SDK instance not available".to_string(),
                })
            }
        }
    }

    pub fn cleanup(&mut self) {
        if self.is_initialized {
            unsafe {
                if let Some(SDKInstance(sdk)) = self.sdk_instance {
                    let _: () = msg_send![sdk, cleanup];
                }
            }
            self.is_initialized = false;
            self.sdk_instance = None;
        }
    }
}

impl Drop for ZoomSDKManager {
    fn drop(&mut self) {
        self.cleanup();
    }
}

// Global SDK manager instance
use std::sync::Mutex;
use std::sync::OnceLock;

static ZOOM_SDK: OnceLock<Mutex<ZoomSDKManager>> = OnceLock::new();

pub fn get_zoom_sdk() -> &'static Mutex<ZoomSDKManager> {
    ZOOM_SDK.get_or_init(|| Mutex::new(ZoomSDKManager::new()))
}