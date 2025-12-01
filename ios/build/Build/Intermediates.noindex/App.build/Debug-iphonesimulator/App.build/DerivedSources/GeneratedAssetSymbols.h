#import <Foundation/Foundation.h>

#if __has_attribute(swift_private)
#define AC_SWIFT_PRIVATE __attribute__((swift_private))
#else
#define AC_SWIFT_PRIVATE
#endif

/// The "Splash" asset catalog image resource.
static NSString * const ACImageNameSplash AC_SWIFT_PRIVATE = @"Splash";

/// The "flex_logo" asset catalog image resource.
static NSString * const ACImageNameFlexLogo AC_SWIFT_PRIVATE = @"flex_logo";

/// The "flex_logo_new" asset catalog image resource.
static NSString * const ACImageNameFlexLogoNew AC_SWIFT_PRIVATE = @"flex_logo_new";

#undef AC_SWIFT_PRIVATE
