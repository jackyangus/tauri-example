/**
 * @file ZMVideoSDKAudioHelper.h
 * @brief Provides audio management interfaces for the Zoom Video SDK.
 */


#import <Foundation/Foundation.h>
#import <ZMVideoSDK/ZMVideoSDKUserHelper.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * @class ZMVideoSDKAudioRawData
 * @brief Represents raw audio data received from the SDK.
 */
@interface ZMVideoSDKAudioRawData : NSObject

/**
 * @brief Buffer data.
 */
@property (nonatomic, assign, readonly, nullable) char* buffer;

/**
 * @brief Buffer length of this data.
 */
@property (nonatomic, assign, readonly) unsigned int bufferLen;

/**
 * @brief Sample rate of this data.
 */
@property (nonatomic, assign, readonly) unsigned int sampleRate;

/**
 * @brief Channel number of this data.
 */
@property (nonatomic, assign, readonly) unsigned int channelNum;
/**
 * @brief Millisecond timestamp.
 */
@property (nonatomic, assign, readonly) long long timeStamp;
/**
 * @brief Determine if the reference count for the interface pointer can be increased.
 * @return If can add reference, it will return YES, otherwise NO.
 * @note If you call addRef, the SDK will try to hold the raw data buffer until the reference becomes 0. When you finish using the raw data buffer, you must call releaseRef to release it.
 */
- (BOOL)canAddRef;

/**
 * @brief Add one to the reference count.
 * @return If the function succeeds, it will return YES, otherwise NO.
 */
- (BOOL)addRef;

/**
 * @brief Subtract one from the reference count.
 * @return If the function succeeds, it will return reference count of this object.
 */
- (int)releaseRef;

@end


/**
 * @class ZMVideoSDKMicDevice
 * @brief Represents a microphone device available to the SDK.
 */
@interface ZMVideoSDKSpeakerDevice : NSObject
    
/**
 * @brief Device id.
 */
@property (nonatomic, copy, readonly) NSString *deviceId;
    
/**
 * @brief Device name.
 */
@property (nonatomic, copy, readonly) NSString *deviceName;
    
/**
 * @brief Determine if the device is selected.
 */
@property (nonatomic, assign, readonly) BOOL isSelectedDevice;
@end


/**
 * @class ZMVideoSDKMicDevice
 * @brief Represents a microphone device available to the SDK.
 */
@interface ZMVideoSDKMicDevice : NSObject
    
/**
 * @brief Device id.
 */
@property (nonatomic, copy, readonly) NSString *deviceId;
    
/**
 * @brief Device name.
 */
@property (nonatomic, copy, readonly) NSString *deviceName;
    
/**
 * @brief Determine if the device is selected.
 */
@property (nonatomic, assign, readonly) BOOL isSelectedDevice;
@end

/**
 * @class ZMVideoSDKAudioHelper
 * @brief Provides methods for managing audio in Zoom Video SDK sessions.
 */
@interface ZMVideoSDKAudioHelper : NSObject
    
/**
 * @brief Start audio with voip.
 * @return If the function succeeds, it will return ZMVideoSDKErrors_Success.
 */
- (ZMVideoSDKErrors)startAudio;
    
/**
 * @brief Stop audio.
 * @return If the function succeeds, it will return ZMVideoSDKErrors_Success.
 */
- (ZMVideoSDKErrors)stopAudio;
    
/**
 * @brief Mute user's voip audio. 0 means current user (myself).
 * @param user The pointer of user object.
 * @return If the function succeeds, it will return ZMVideoSDKErrors_Success.
 */
- (ZMVideoSDKErrors)muteAudio:(ZMVideoSDKUser*)user;
    
/**
 * @brief UnMute user's voip audio.
 * @param user The pointer of user object.
 * @return If the function succeeds, it will return ZMVideoSDKErrors_Success.
 */
- (ZMVideoSDKErrors)unMuteAudio:(ZMVideoSDKUser*)user;
    
/*!
 * @brief Allow the others to unmute themselves or not. For host or manager.
 * @param allowUnmute Yes means allow the user to unmute themself, otherwise NO.
 * @return If the function succeeds, it will return ZMVideoSDKErrors_Success.
 */
- (ZMVideoSDKErrors)allowAudioUnmutedBySelf:(BOOL)allowUnmute;

/**
 * @brief Mute all user's VIOP audio except my self.
 * @param allowUnmute Yes means means allow the user to unmute themself, otherwise NO.
 * @return If the function succeeds, it will return ZMVideoSDKErrors_Success.
 */
- (ZMVideoSDKErrors)muteAllAudio:(BOOL)allowUnmute;

/**
 * @brief Ask to unmute all user's VOIP audio.
 * @return If the function succeeds, it will return ZMVideoSDKErrors_Success.
 */
- (ZMVideoSDKErrors)unmuteAllAudio;

/**
 * @brief Get speaker device list.
 * @return If the function succeeds, the return value is speaker device list, otherwise returns nil.
 */
- (NSArray<ZMVideoSDKSpeakerDevice *>* _Nullable)getSpeakerList;
    
/**
 * @brief Get mic device list.
 * @return If the function succeeds, the return value is mic device list, otherwise returns nil.
 */
- (NSArray<ZMVideoSDKMicDevice *>* _Nullable)getMicList;
    
/**
 * @brief Select one speaker device as default device.
 * @param deviceId Device id.
 * @param name Device name.
 * @return If the function succeeds, it will return ZMVideoSDKErrors_Success.
 */
- (ZMVideoSDKErrors)selectSpeaker:(NSString *)deviceId deviceName:(NSString *)name;
    
/**
 * @brief Select one mic device as default device.
 * @param deviceId Device id.
 * @param name Device name.
 * @return If the function succeeds, it will return ZMVideoSDKErrors_Success.
 */
- (ZMVideoSDKErrors)selectMic:(NSString *)deviceId deviceName:(NSString *)name;
    
/**
 * @brief Subscribe audio raw data.
 * @return If the function succeeds, it will return ZMVideoSDKErrors_Success.
 */
- (ZMVideoSDKErrors)subscribe;
    
/**
 * @brief UnSubscribe audio raw data.
 * @return If the function succeeds, it will return ZMVideoSDKErrors_Success.
 */
- (ZMVideoSDKErrors)unSubscribe;
@end

NS_ASSUME_NONNULL_END
