use std::path::PathBuf;

fn main() {
    tauri_build::build();
    
    // Link Zoom Video SDK frameworks
    let framework_path = PathBuf::from("libs");
    
    println!("cargo:rustc-link-search=framework={}", framework_path.display());
    println!("cargo:rustc-link-lib=framework=ZMVideoSDK");
    println!("cargo:rustc-link-lib=framework=ZoomTask");
    println!("cargo:rustc-link-lib=framework=ZoomVideoSDKMeetingBridge");
    println!("cargo:rustc-link-lib=framework=cmmbiz");
    println!("cargo:rustc-link-lib=framework=cmmlib");
    println!("cargo:rustc-link-lib=framework=curl64");
    println!("cargo:rustc-link-lib=framework=nydus");
    println!("cargo:rustc-link-lib=framework=protobuf");
    println!("cargo:rustc-link-lib=framework=tp");
    println!("cargo:rustc-link-lib=framework=util");
    println!("cargo:rustc-link-lib=framework=viper");
    println!("cargo:rustc-link-lib=framework=xmpp_framework");
    println!("cargo:rustc-link-lib=framework=zEventTracker");
    println!("cargo:rustc-link-lib=framework=zNetUtils");
    
    // Link dynamic libraries
    println!("cargo:rustc-link-lib=dylib=VideoSDK");
    println!("cargo:rustc-link-lib=dylib=cares");
    println!("cargo:rustc-link-lib=dylib=crypto");
    println!("cargo:rustc-link-lib=dylib=json");
    println!("cargo:rustc-link-lib=dylib=looper");
    println!("cargo:rustc-link-lib=dylib=minizip");
    println!("cargo:rustc-link-lib=dylib=ssl");
    println!("cargo:rustc-link-lib=dylib=zContext");
    println!("cargo:rustc-link-lib=dylib=zoombase_crypto_shared");
}