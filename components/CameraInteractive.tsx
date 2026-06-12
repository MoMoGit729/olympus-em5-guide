"use client";
import { useState, useEffect } from "react";
import React from "react";

// ── Color tokens ────────────────────────────────────────────
const C = {
  bg:         "#f0ece4",
  card:       "#e6e1d8",
  cardHead:   "#dbd5cb",
  teal:       "#2d6464",
  sage:       "#6b8c7a",
  heading:    "#1a3030",
  body:       "#3a4a44",
  muted:      "#5a7a6e",
  faint:      "#8a9e92",
  border:     "#c8c2b6",
};

interface Part {
  id:          string;
  title:       string;
  description: string;
}

const FRONT_PARTS: Part[] = [
  {
    id: "mode-dial-lock",
    title: "Mode Dial Lock",
    description: `A centre press-button on the mode dial that must be held down to rotate the dial. This prevents the mode dial from shifting accidentally when the camera is in a bag or being handled.

To change shooting modes: press and hold the lock button with your thumb while rotating the mode dial with your fingers to the desired position, then release.

The lock engages automatically as soon as you let go — you can't leave it unlocked.`,
  },
  {
    id: "rear-dial",
    title: "Rear Dial",
    description: `The main rotary dial on the upper back of the camera, operated with your right thumb. In most shooting modes it controls aperture, and in others it adjusts shutter speed or other parameters depending on the active mode.

In P mode: rotate to shift the program (change the shutter/aperture combination while keeping the same exposure).
In A mode: rotate to set aperture.
In S mode: rotate to set shutter speed.
In M mode: rotate to set aperture; use the front dial for shutter speed.

During playback: rotate to scroll through images.

The rear dial symbol is used throughout the Olympus manual to indicate rear-dial operations.`,
  },
  {
    id: "shutter-button",
    title: "Shutter Button",
    description: `The two-stage release button for capturing images.

Half-press: activates the autofocus system and exposure meter, locks focus when AF confirms, and wakes the camera from sleep. Hold the half-press to keep AF active while composing.

Full press: fires the shutter and records the image. The buffer indicator in the viewfinder or monitor shows remaining capacity for burst shooting.

A half-press also cancels menu navigation and returns the camera to shooting mode. For manual focus, a half-press still activates the exposure meter without triggering AF.`,
  },
  {
    id: "movie-button",
    title: "Movie / H Button",
    description: `The red-accented button on the top plate. Its function depends on how it is configured.

Default function: starts and stops video recording in any shooting mode. Press once to start recording; press again to stop. A red recording indicator appears in the monitor or EVF during capture.

The H function (accessible via a Fn lever position) can be assigned to a custom shortcut through the camera's button/dial/lever customisation menu — for example, to quickly call up a frequently used setting.

In live view, pressing this button during stills shooting starts video recording immediately without entering a dedicated movie mode first.`,
  },
  {
    id: "exp-comp-button",
    title: "Exposure Compensation Button",
    description: `Marked with a +/– symbol. Press and hold this button while rotating the rear dial to shift the exposure brighter or darker relative to what the camera meters.

Range: –5 EV to +5 EV in 1/3 or 1/2 stop steps (configurable in the custom menu).

Practical use:
– Bright subjects against dark backgrounds (snow, white walls): dial in +1 to +2 EV to prevent underexposure.
– Dark subjects against bright backgrounds (backlit portraits): add +1 to +2 EV.
– High-key or low-key creative shots: use the full range deliberately.

The set value remains active until you reset it. A small indicator appears in the EVF/monitor when compensation is active — a useful reminder to zero it out before moving to the next scene.`,
  },
  {
    id: "front-dial",
    title: "Front Dial",
    description: `The secondary rotary dial on the front of the camera, operated with your right index finger. It works in combination with the rear dial to give you two-dial control over exposure in manual and semi-automatic modes.

In M mode: controls shutter speed (rear dial controls aperture).
In other modes: can be configured via the custom menu to adjust ISO, white balance, or other frequently changed parameters.

Having both dials available means you can change shutter speed and aperture simultaneously in M mode without pressing any other buttons — the way most experienced photographers prefer to work.`,
  },
  {
    id: "lens-mark",
    title: "Lens Attachment Mark",
    description: `A small red dot on the camera body at the lens mount. A matching red dot appears on every Micro Four Thirds lens.

To attach a lens: align the two red dots, insert the lens, and rotate clockwise until you feel and hear a firm click.
To remove a lens: press and hold the lens release button, then rotate the lens counter-clockwise until it lifts free.

Always power the camera off before attaching or removing lenses, and point the mount slightly downward in dusty environments to reduce the chance of particles entering the sensor chamber.`,
  },
  {
    id: "preview-button",
    title: "Preview Button",
    description: `Stops the lens down to the shooting aperture so you can preview depth of field in the EVF or monitor before taking the shot.

At wide apertures (low f-numbers), depth of field is shallow and the out-of-focus blur (bokeh) is pronounced. At narrow apertures (high f-numbers) more of the scene appears sharp.

Hold the preview button while composing to judge whether the background blur or foreground sharpness is what you intend. The image in the EVF will darken at narrow apertures — this is normal. The preview button can also be reassigned via the custom button menu to any other function you prefer.`,
  },
  {
    id: "mount",
    title: "Lens Mount",
    description: `The Micro Four Thirds (MFT) bayonet mount — the standard shared by Olympus (now OM System) and Panasonic Lumix cameras. Any lens carrying the Micro Four Thirds logo will fit and communicate fully with the camera's AF, image stabilisation, and metering systems.

The MFT sensor has a 2× crop factor relative to 35mm full-frame. A 25mm MFT lens gives a field of view equivalent to 50mm on full-frame; a 75mm MFT lens is equivalent to 150mm.

Keep the body cap on whenever no lens is mounted, and store lenses with both caps attached to protect the rear element and mount contacts.`,
  },
  {
    id: "mode-dial",
    title: "Mode Dial",
    description: `The large dial on the top plate that selects the main shooting mode.

P – Program Auto: camera sets shutter speed and aperture; you can shift the combination.
A – Aperture Priority: you set aperture; camera sets shutter speed.
S – Shutter Priority: you set shutter speed; camera sets aperture.
M – Manual: you set both shutter speed and aperture independently.
B – Bulb: shutter stays open while the button is held (for long exposures on a tripod).
Movie: dedicated video recording mode with movie-specific settings.
SCN: selects from preset scene modes via the menu.
ART: applies creative in-camera art filter effects.
AP – Auto Program: fully automatic, camera-controlled mode.

The dial has a centre lock button — hold it down to rotate.`,
  },
  {
    id: "stereo-mic",
    title: "Stereo Microphone",
    description: `Two small grille openings near the top of the camera body that capture stereo audio during video recording.

The built-in stereo mic picks up sound from a relatively wide angle. For serious video work, connecting an external microphone via the 3.5mm mic jack gives you better sound isolation, directionality, and overall quality.

Wind noise is the most common problem with built-in mics outdoors. The camera has a wind noise reduction setting in the video menu. Alternatively, a small dead-cat windshield on an external mic eliminates wind noise almost entirely.`,
  },
  {
    id: "on-off",
    title: "ON/OFF Lever",
    description: `The power switch surrounding the shutter button. Rotate it to power the camera on or off.

On first power-up, the camera will prompt you to set the date, time, and language if it hasn't been configured yet.

The camera has a sleep/auto-off timer that dims the monitor and EVF after a period of inactivity — adjustable in the setup menu. A half-press of the shutter wakes it instantly without fully cycling the power.

Always power off before changing lenses or batteries, and before storing the camera in a bag. Leaving the camera on in sleep mode still drains the battery slowly.`,
  },
  {
    id: "lv-button",
    title: "LV Button",
    description: `The LV (Live View) button toggles between the electronic viewfinder and the rear monitor as the primary display.

Press once: switches display to the rear monitor.
Press again: returns to the EVF.
(Some configurations also cycle through EVF-only or auto-switching via the eye sensor.)

The eye sensor can be set to switch automatically between EVF and monitor when you raise the camera to your eye — configurable in the setup menu. The LV button gives you a manual override of that automatic behaviour when you want to lock to one display.`,
  },
  {
    id: "drive-button",
    title: "Sequential / Self-Timer / HDR Button",
    description: `Cycles through drive modes and related capture options. Press the button and then use the dials or arrow pad to select:

Single shot: one frame per shutter press.
Sequential shooting (low/high): continuous burst at a specified frame rate while the shutter is held.
Self-timer: 2-second or 12-second delay before the shutter fires — useful for avoiding camera shake on a tripod or for including yourself in the frame.
Anti-shock / Anti-shock + self-timer: introduces a brief delay between mirror/shutter movement and image capture to eliminate vibration (important for macro and telephoto work).
HDR: camera takes multiple exposures automatically and combines them in-camera for extended tonal range.

The available options and maximum burst rates depend on the shooting mode and image format.`,
  },
  {
    id: "self-timer-lamp",
    title: "Self-Timer Lamp / AF Illuminator",
    description: `A small LED on the front of the camera with two roles:

Self-timer indicator: flashes slowly during the countdown, then rapidly in the final two seconds before the shutter fires. Useful visual confirmation that the camera is about to shoot.

AF illuminator: emits a brief pattern of light in low-contrast or dark conditions to help the autofocus system find edges and achieve focus lock. Effective at close to moderate distances (roughly 1–3 metres). The illuminator can be disabled in the AF menu if it would be disruptive.`,
  },
  {
    id: "mic-jack-cover",
    title: "Microphone Jack Cover",
    description: `A rubber cover protecting the 3.5mm stereo microphone input. Pull the cover aside to access the jack.

An external microphone plugged in here replaces the built-in stereo mics entirely. This is the most effective upgrade for video audio quality — a small directional (shotgun) or cardioid microphone dramatically reduces background noise and improves voice recording.

Always replace the cover when not in use to prevent dust and moisture from entering the connector.`,
  },
  {
    id: "remote-cover",
    title: "Remote Cable Terminal Cover",
    description: `Protects the port for Olympus-compatible remote shutter release cables. Connecting a remote cable lets you fire the shutter without touching the camera body — essential for long exposures, macro photography, and any situation where even the lightest camera shake would degrade the image.

For bulb exposures, a lockable remote cable is especially useful because you can lock the shutter open without holding the button continuously. Replace the cover when the remote is not in use.`,
  },
  {
    id: "connector-cover-front",
    title: "Connector Cover (Front Side)",
    description: `A rubber port cover on the front-left panel protecting the HDMI and USB connectors. Pull it open to access either connector.

Keep this cover closed when the connectors are not in use — the rubber seal helps protect the internal contacts from dust and moisture, which matters particularly in field conditions. The cover is attached by a thin hinge; avoid pulling it too far open to prevent tearing.`,
  },
  {
    id: "strap-eyelet",
    title: "Strap Eyelet",
    description: `The metal loop where the camera strap attaches. The E-M5 Mark III has eyelets on both sides of the body.

Thread the strap through the eyelet and through the plastic retaining clip before looping it back — the clip prevents the strap from working loose over time. Always check strap attachment before shooting, especially if you carry the camera on your shoulder or around your neck for extended periods.

Third-party peak design anchors or similar systems can be used with compatible strap systems if you prefer a quick-release setup.`,
  },
  {
    id: "lens-release",
    title: "Lens Release Button",
    description: `The button on the front of the camera body, beside the lens mount. Press and hold it while rotating the lens counter-clockwise to detach the lens.

Never try to remove a lens without pressing this button — the bayonet lock will resist and forcing it can damage both the lens mount and the body contacts.

Cover the exposed sensor chamber with your hand or a body cap immediately after removing a lens, especially outdoors, to minimise dust exposure. The camera's built-in sensor-shift image stabilisation mechanism can move the sensor slightly; avoid touching or blowing into the chamber.`,
  },
  {
    id: "lens-lock-pin",
    title: "Lens Lock Pin",
    description: `A small spring-loaded pin inside the lens mount that engages a corresponding recess in the lens when it is rotated to the locked position. This is what holds the lens securely in place during shooting.

You will feel and hear a distinct click when the lens is properly locked. If you don't hear the click after attaching a lens, rotate it slightly further until the pin engages. Never shoot with a lens that isn't fully locked — it can cause the lens to drop or produce erratic communication errors.`,
  },
  {
    id: "mic-jack",
    title: "Microphone Jack",
    description: `A 3.5mm stereo mini-plug input for an external microphone. When a microphone is connected here, the built-in stereo mics are disabled and all audio is recorded from the external source.

Suitable microphones include cardioid condenser mics (good for interviews and controlled environments), directional shotgun mics (good for video, isolates sound from the front), and lavalier mics (clipped to clothing for close-range voice recording).

Check the camera's audio level display in video mode after connecting an external mic and adjust the input level in the audio/movie menu to avoid clipping.`,
  },
  {
    id: "remote-terminal",
    title: "Remote Cable Terminal",
    description: `The port for connecting an Olympus-compatible electronic remote shutter release cable (such as the RM-UC1). The remote cable plugs in here and allows you to trigger the shutter without physically pressing the shutter button.

This is the recommended method for long exposures (B/bulb mode), macro photography on a tripod, or any situation where pressing the shutter button would cause unwanted vibration. Some remote cables include a locking mechanism to hold the shutter open in bulb mode without your finger on the button.`,
  },
  {
    id: "hdmi",
    title: "HDMI Connector (Type D)",
    description: `A micro-HDMI (Type D) output for connecting the camera to an external monitor, TV, or video recorder via a standard micro-HDMI cable.

During shooting: an external monitor shows the live view feed — useful when the camera is mounted at an awkward angle (overhead, low to the ground) or for showing a scene to clients or collaborators.

For playback: images and video are displayed on the connected screen at full resolution.

Note: micro-HDMI cables and connectors are fragile. Support the cable at the camera body to avoid stressing the port, and never leave a long cable unsupported during a shoot.`,
  },
  {
    id: "usb",
    title: "Micro-USB Connector",
    description: `The USB port for connecting the camera to a computer for image transfer or tethered shooting, and for in-camera charging via a compatible USB charger or power bank.

For image transfer: connect the USB cable, power on the camera, and select "Storage" in the USB mode prompt. The camera appears as a removable drive on your computer.

For charging: the camera charges via USB when connected to a compatible charger (5V). Charging while shooting keeps the battery topped up during long sessions on a tripod.

For tethered shooting: compatible software (such as Olympus Capture) can trigger the shutter and transfer images to a computer in near real time.`,
  },
];

const BACK_PARTS: Part[] = [
  {
    id: "diopter",
    title: "Diopter Adjustment Dial",
    description: `A small ridged dial beside the viewfinder eyepiece that corrects the EVF's optical focus to match your eyesight — the equivalent of adjusting binoculars for your eyes.

To set it: look through the EVF with the camera powered on and a subject visible. Rotate the dial until the information overlays and the image itself appear sharp and crisp. If you wear glasses you can often shoot without them once the diopter is set correctly.

Once adjusted for your vision, you'll only need to revisit it if someone else uses the camera. Some photographers tape the dial lightly once set to prevent accidental movement.`,
  },
  {
    id: "monitor",
    title: "Monitor (Touch Screen)",
    description: `A tilting touchscreen LCD on the back of the camera. It tilts up approximately 80° and down approximately 50°, which is useful for shooting from low angles, waist-level, or overhead without having to crouch or contort.

Touch functions:
– Tap to set the focus point anywhere on the frame (Touch AF / Touch Shutter).
– Tap the shutter icon or the screen itself (if Touch Shutter is enabled) to focus and shoot.
– Pinch to zoom in playback; swipe to advance images.
– Navigate menus by tapping options directly.

In bright sunlight, the screen can wash out. Switching to the EVF, or boosting monitor brightness in the display settings, helps. The monitor brightness can also be set to Auto to adjust based on ambient light.`,
  },
  {
    id: "viewfinder",
    title: "Viewfinder (EVF)",
    description: `A 2.36-million-dot electronic viewfinder (EVF). Unlike a traditional optical viewfinder, the EVF shows a live electronic image of exactly what the sensor sees — including a real-time preview of your current exposure, white balance, and picture profile before you take the shot.

Key advantages of the EVF:
– Exposure preview: you see the effect of your settings in real time; overexposed areas appear blown, underexposed areas appear dark.
– Works in any light: no blackout in bright sun.
– Overlays: focus peaking, histogram, level gauge, and other displays are visible while composing.
– Eye sensor: the EVF activates automatically when you raise the camera to your eye.

The EVF refresh rate and resolution can be adjusted in the setup menu for a balance between smoothness and battery life.`,
  },
  {
    id: "eye-sensor",
    title: "Eye Sensor",
    description: `An infrared proximity sensor below the viewfinder eyepiece. When your eye or hand approaches, it automatically switches the display from the rear monitor to the EVF.

Moving away switches back to the monitor.

You can configure the switching behaviour in the setup menu:
– Auto: switches based on sensor detection (default).
– EVF only: always shows EVF, monitor stays off.
– Monitor only: always shows monitor, EVF stays off.

If you find the sensor triggering accidentally (e.g. when the camera is in a bag or on a strap), set it to Monitor only or EVF only temporarily. The LV button on the front of the camera also provides a quick manual override.`,
  },
  {
    id: "eyecup",
    title: "Eyecup",
    description: `The rubber cup surrounding the viewfinder eyepiece. It creates a light seal between your eye and the EVF, blocking stray ambient light from washing out the image in the viewfinder and making extended viewing more comfortable.

The eyecup is a standard Olympus accessory part and can be removed and replaced if it becomes worn or torn. Replacements are available from Olympus/OM System accessory suppliers.

When shooting on a tripod with the self-timer, shield the eyepiece from bright light sources behind you to prevent light from entering the EVF and affecting metering.`,
  },
  {
    id: "menu-button",
    title: "MENU Button",
    description: `Opens the camera's full menu system. The Olympus menu is organised into several tabs:

Shooting Menu 1 & 2: image quality, aspect ratio, noise reduction, bracketing, flash settings, and AF options.
Video Menu: frame rate, video quality, audio levels, video stabilisation.
Playback Menu: display options, protect, print settings, image editing.
Setup Menu: date/time, display settings, card formatting, sensor cleaning, firmware, and general preferences.
Custom Menu: deep customisation — button assignments, dial behaviour, AF fine-tuning, live view display, EVF settings, and more.

Navigate with the arrow pad; press OK to confirm a selection. Press Menu again or half-press the shutter to exit without making changes.`,
  },
  {
    id: "hot-shoe",
    title: "Hot Shoe",
    description: `The standard ISO accessory shoe on the top of the camera for mounting compatible flash units, EVF accessories, or other hot-shoe devices.

The E-M5 III hot shoe is compatible with Olympus/OM System electronic flash units (FL series) for full TTL flash control, high-speed sync, and wireless flash triggering when used with compatible groups.

Third-party flashes using the standard centre pin fire the flash but without TTL metering — you'll set flash output manually. Radio and optical wireless triggers can also be mounted here to control off-camera flash.

The hot shoe makes full electrical contact only when a unit is slid fully in and the locking wheel (if present) is tightened.`,
  },
  {
    id: "ael-afl",
    title: "AEL/AFL / Protect Button",
    description: `A dual-function button. In shooting mode it acts as AEL/AFL; in playback mode it acts as Protect.

AEL (Auto Exposure Lock): hold this button to lock the current exposure reading. The meter is frozen while you recompose, allowing you to expose for a specific part of the scene and then frame the shot differently.

AFL (Auto Focus Lock): in some AF mode configurations, this button is used to lock focus independently from the shutter button — a technique called back-button focus, which separates focus activation from shutter release for more flexible control in dynamic shooting situations.

The AEL/AFL behaviour is highly configurable in the custom menu — you can choose whether it locks exposure, focus, or both, and whether it works as a toggle or momentary hold.

In playback: press this button to protect the current image from accidental deletion.`,
  },
  {
    id: "fn-lever",
    title: "Fn Lever",
    description: `A two-position lever on the back of the camera that instantly switches the custom function assignments of multiple buttons simultaneously.

Position 1: buttons perform their default or first custom assignment.
Position 2: buttons perform alternate assignments defined in the custom menu.

This is an extremely useful feature for photographers who work across very different shooting scenarios — for example, lever position 1 for stills (with AF, ISO, and metering shortcuts) and lever position 2 for video (with different button assignments for audio level, IS mode, etc.). You can flip between the two setups in a single thumb movement.

Set up via: Custom Menu → Button/Dial/Lever → Lever Function.`,
  },
  {
    id: "speaker",
    title: "Speaker",
    description: `The built-in mono speaker on the back of the camera for audio playback of video clips and audio-tagged still images.

Volume is controllable in the playback menu. The speaker is adequate for confirming that audio was recorded, but not intended for critical audio monitoring. For proper audio review, use headphones connected to an external monitor or audio recorder.

The speaker also emits the AF confirmation beep and shutter operation sound effects (which can be disabled in the setup menu — useful in quiet environments or when quiet operation is preferred).`,
  },
  {
    id: "iso-button",
    title: "ISO Button",
    description: `Pressing this button opens the ISO selection screen directly, without going into the menu.

ISO controls the sensor's sensitivity to light:
– Low ISO (200–400): cleanest images with the least digital noise. Use in good light.
– Mid ISO (800–1600): slightly more noise, still very usable. Good for indoor available light.
– High ISO (3200–6400): visible noise in shadow areas. Acceptable for action or low light when necessary.
– Auto ISO: the camera chooses ISO automatically based on the exposure requirements; you can set a maximum ISO limit.

The E-M5 III has effective in-body image stabilisation (IBIS) which often lets you use lower ISO and slower shutter speeds than you might otherwise need — take advantage of this before reaching for higher ISO values.`,
  },
  {
    id: "info-button",
    title: "INFO Button",
    description: `Cycles through the available information overlays on the monitor or EVF.

In shooting mode: each press cycles through different display layouts — live histogram, highlight/shadow warning, level gauge, shooting data, and a clean view with minimal overlays. Choose the display that best suits your current workflow.

In playback mode: cycles through image information screens — basic file data, full shooting EXIF data (shutter speed, aperture, ISO, focal length, GPS if recorded), histogram view, and highlight blinkies (overexposure warning).

Learning to read the live histogram in the EVF while composing is one of the most useful habits you can build — it tells you immediately whether your exposure is clipping highlights or crushing shadows.`,
  },
  {
    id: "q-button",
    title: "Q Button (Quick Menu)",
    description: `Opens the Quick Menu — a configurable overlay of the most frequently adjusted shooting parameters, accessible without entering the full menu system.

The Quick Menu grid typically includes: image quality, white balance, ISO, metering mode, AF mode, AF area, flash mode, image stabilisation mode, aspect ratio, and picture mode. The exact contents are configurable in the custom menu.

Navigate with the arrow pad; adjust the highlighted setting with the front or rear dial. Press OK to confirm, or press Q again to close.

The Quick Menu is the fastest way to make multiple adjustments between shots. Spending a few minutes customising it to include only the settings you actually change regularly is well worth the effort.`,
  },
  {
    id: "arrow-pad",
    title: "Arrow Pad",
    description: `The four-directional navigation pad (up, down, left, right). It is used for menu navigation and also has direct function assignments in shooting mode.

In menus: navigates between options; right confirms or enters a sub-menu; left goes back.

In shooting mode: each direction can be assigned a direct function — for example, left for white balance, right for drive mode, up for ISO, down for AF area. These assignments are configurable in the custom menu.

During playback: left/right advances through images; up/down cycles through display information screens.

In AF area selection mode: moves the AF point or zone across the frame.

The centre button of the pad acts as OK/Set.`,
  },
  {
    id: "playback-button",
    title: "Playback Button",
    description: `Switches the camera into playback mode to review captured images and video clips.

In playback:
– Arrow pad left/right: advance through images.
– Pinch on touchscreen or rear dial: zoom in for a closer look; check focus at 100%.
– Arrow pad up/down or INFO button: cycle through image info overlays.
– Q button or touchscreen: access playback quick menu (protect, delete, edit, print).
– Half-press shutter: exit playback and return to shooting mode instantly.

Video clips show a play button overlay — press OK or tap the touchscreen to play back. Audio plays through the speaker or any connected headphones.

Zooming in to 100% to verify sharpness on keeper shots is a good field habit, especially for critical or once-only moments.`,
  },
  {
    id: "erase-button",
    title: "Erase Button",
    description: `Deletes the current image or video in playback mode. Press once to show the confirmation prompt; press again to confirm deletion. Press the playback button or shutter half-press to cancel.

For deleting multiple images at once: use Playback Menu → Erase → Select, which lets you check-mark individual images for batch deletion.

Deletion is permanent and cannot be undone in-camera. If there is any doubt, use the Protect function (AEL/AFL button in playback) to mark images safe before doing any bulk deletions.

Formatting the card (Setup Menu → Card Setup → Format) will erase everything including protected images — use formatting periodically to maintain card health, but only after confirming all images are backed up.`,
  },
  {
    id: "charge-lamp",
    title: "CHARGE Lamp",
    description: `An indicator LED that shows battery charging status when the camera is connected via USB to a charger or computer.

Blinking slowly: charging in progress.
Solid on: charge complete.
Blinking rapidly or off: charging error — check the USB connection, try a different cable or charger, and verify the battery is seated correctly.

The E-M5 III supports in-camera USB charging, which is convenient for travel or field use with a power bank. Charging while the camera is off is faster than charging while it is on. A full charge from empty typically takes a couple of hours depending on the charger output.`,
  },
  {
    id: "connector-cover-back",
    title: "Connector Cover (Left Side)",
    description: `A rubber port cover on the left side panel protecting the HDMI and USB connectors. Open it to access either port.

The cover is hinged at one edge — pull carefully at the free edge to open it, and press it firmly closed afterward. The rubber seal is the only environmental protection the connectors have, so keeping it closed when not in use is important, especially in damp or dusty conditions.

If the cover is damaged or torn, replacement covers are available as Olympus service parts.`,
  },
  {
    id: "tripod-socket",
    title: "Tripod Socket",
    description: `A standard 1/4"-20 UNC threaded socket on the base of the camera for attaching to tripods, monopods, or any other accessory with a standard 1/4" screw.

Always tighten the tripod head plate securely before mounting the camera, and periodically check that the screw hasn't worked loose during a shoot — vibration from movement can cause gradual loosening.

When using the E-M5 III's in-body image stabilisation with a supported lens, consider turning off IS or switching to a tripod-specific IS mode when the camera is mounted on a tripod, to avoid the IS system fighting the fixed mount.`,
  },
  {
    id: "battery-cover",
    title: "Battery Compartment Cover",
    description: `The hinged door on the base of the camera that opens to give access to the battery compartment. Slide the battery compartment lock to the open position and the cover springs open.

Always power the camera off before opening the battery compartment. Check that the card access indicator in the monitor or EVF is not active before opening, as opening the cover during a write operation can corrupt image files.

Insert the battery with the contacts leading in, oriented as shown by the diagram inside the compartment. The battery clicks into place and a small latch holds it secure.`,
  },
  {
    id: "battery-lock",
    title: "Battery Compartment Lock",
    description: `A sliding latch on the base of the camera that locks the battery compartment cover closed. Slide it in the direction of the arrow to unlock the cover, then slide it back to lock after closing.

The lock requires deliberate force to operate, which prevents the battery compartment from opening accidentally if the camera is dropped or handled roughly.

If you are storing the camera for an extended period, remove the battery to prevent slow discharge and potential corrosion. Store the battery in a cool, dry place at approximately 50% charge for best long-term health.`,
  },
  {
    id: "card-cover",
    title: "Card Compartment Cover",
    description: `The hinged door on the base panel that protects the SD card slot. Open it to insert or remove the memory card.

Always power the camera off before opening the card compartment. Confirm the card access indicator is off before opening — data is being written to the card if it is active, and interrupting this will corrupt the files being saved.

Push the card in gently until it clicks into place (label facing the back of the camera). To eject, press the card inward slightly; it springs out enough to grip.

Periodically formatting the card in-camera (Setup Menu → Card Setup → Format) keeps the file system clean and reduces the risk of write errors. Always back up your images before formatting.`,
  },
  {
    id: "card-slot",
    title: "Card Slot",
    description: `Accepts a single SD/SDHC/SDXC memory card. For best performance, use a UHS-I Speed Class 3 (U3) or higher card — this is the minimum recommended rating for 4K video recording and high-speed burst shooting.

Card speed matters for burst photography: a fast card allows the buffer to clear more quickly, letting you resume shooting sooner after a burst sequence. For stills-only shooting, a UHS-I Class 10 card is generally sufficient.

For long video recordings, a high-endurance card designed for continuous writing (rather than a standard photo card) will be more reliable and less prone to write errors over time.`,
  },
];

const CircNum = ({ n }: { n: number }) => (
  <span style={{
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    width:          "24px",
    height:         "24px",
    minWidth:       "24px",
    borderRadius:   "50%",
    border:         "1.5px solid #2a5050",
    color:          "#1a3030",
    fontSize:       "12px",
    fontWeight:     700,
    fontFamily:     "system-ui",
    lineHeight:     1,
  }}>{n}</span>
);

export default function CameraInteractive({ chatOpen, onChatClose, children }: {
  chatOpen: boolean;
  onChatClose: () => void;
  children?: React.ReactNode;
}) {
  const [tab, setTab]           = useState<"front" | "back">("front");
  const [selected, setSelected] = useState<Part | null>(null);
  const [isOpen, setIsOpen]     = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);

  const parts = tab === "front" ? FRONT_PARTS : BACK_PARTS;

  useEffect(() => {
    if (!localStorage.getItem("em5-guide-welcomed")) setFirstVisit(true);
  }, []);

  const markSeen = () => {
    localStorage.setItem("em5-guide-welcomed", "1");
    setFirstVisit(false);
  };

  useEffect(() => {
    if (chatOpen) { markSeen(); setSelected(null); setIsOpen(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen]);

  const choose = (part: Part) => {
    markSeen();
    setSelected(part);
    setIsOpen(false);
    onChatClose();
  };

  const switchTab = (t: "front" | "back") => {
    if (t === "back") markSeen();
    setTab(t);
    setSelected(null);
    setIsOpen(false);
  };

  return (
    <div className="camera-layout">

      {/* Left column — diagram */}
      <div className="camera-diagram-col">

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          {(["front", "back"] as const).map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                flex:            1,
                padding:         "9px 0",
                backgroundColor: tab === t ? C.teal : C.card,
                border:          `1px solid ${tab === t ? C.teal : C.border}`,
                borderRadius:    "8px",
                color:           tab === t ? C.bg : C.muted,
                fontSize:        "15px",
                fontWeight:      tab === t ? 700 : 400,
                fontFamily:      "system-ui",
                cursor:          "pointer",
                transition:      "background 0.15s, color 0.15s, border 0.15s",
                letterSpacing:   "0.02em",
              }}
            >
              {t === "front" ? "Front" : "Back"}
            </button>
          ))}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tab === "front" ? "/front-diagram.png" : "/back-diagram.png"}
          alt={`Olympus E-M5 Mark III — ${tab === "front" ? "Front" : "Back"} of Camera`}
          style={{
            width:        "100%",
            height:       "auto",
            display:      "block",
            borderRadius: "8px",
            marginBottom: "6px",
            border:       `2px solid ${C.teal}`,
            boxSizing:    "border-box",
          }}
          draggable={false}
        />
        <p style={{
          margin:        "0",
          fontSize:      "11px",
          color:         C.faint,
          textAlign:     "center",
          letterSpacing: "0.02em",
        }}>
          © Olympus E-M5 Mark III Manual
        </p>
      </div>

      {/* Right column — controls */}
      <div className="camera-controls-col">

        {/* Welcome card — first visit, front tab only */}
        {firstVisit && tab === "front" && !selected && !chatOpen && (
          <div style={{
            marginBottom:    "20px",
            backgroundColor: C.card,
            border:          `1px solid ${C.border}`,
            borderRadius:    "10px",
            padding:         "20px 22px",
            animation:       "fadeIn 0.3s ease",
          }}>
            <h2 style={{
              color:      C.teal,
              fontSize:   "18px",
              fontWeight: 700,
              margin:     "0 0 14px 0",
              fontFamily: "system-ui",
            }}>
              Welcome to Your E-M5 III Guide
            </h2>
            <p style={{ color: C.heading, fontSize: "17px", margin: "0 0 10px 0", lineHeight: 1.6 }}>
              Switch between the Front and Back tabs to view each diagram, then choose a part from the menu to learn what it does.
            </p>
            <p style={{ color: C.heading, fontSize: "17px", margin: 0, lineHeight: 1.6 }}>
              Tap the <strong style={{ color: C.teal }}>?</strong> button to ask your Photo Assistant anything about the camera or photography.
            </p>
          </div>
        )}

        {/* Dropdown label */}
        <p style={{
          color:       C.teal,
          fontSize:    "16px",
          margin:      "0 0 8px 0",
          fontWeight:  700,
          paddingLeft: "2px",
        }}>
          {tab === "front" ? "Front of camera — " : "Back of camera — "}select a part
        </p>

        {/* Custom dropdown */}
        <div style={{ position: "relative" }}>

          {/* Trigger button */}
          <button
            onClick={() => setIsOpen(o => !o)}
            style={{
              width:           "100%",
              padding:         "14px 16px",
              backgroundColor: isOpen ? C.cardHead : C.card,
              border:          `1px solid ${isOpen ? C.teal : C.border}`,
              borderRadius:    isOpen ? "10px 10px 0 0" : "10px",
              color:           selected ? C.heading : C.muted,
              fontSize:        "17px",
              fontFamily:      "system-ui",
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "space-between",
              cursor:          "pointer",
              textAlign:       "left",
              transition:      "border 0.15s, background 0.15s",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              {selected
                ? <><CircNum n={parts.findIndex(p => p.id === selected.id) + 1} />{selected.title}</>
                : "Choose a part to learn about it…"}
            </span>
            <span style={{
              display:    "inline-block",
              fontSize:   "24px",
              color:      C.teal,
              marginLeft: "8px",
              flexShrink: 0,
              lineHeight: 1,
            }}>
              {isOpen ? "▴" : "▾"}
            </span>
          </button>

          {/* Dropdown list */}
          {isOpen && (
            <div style={{
              position:        "absolute",
              top:             "100%",
              left:            0,
              right:           0,
              backgroundColor: C.card,
              border:          `1px solid ${C.teal}`,
              borderTop:       `1px solid ${C.border}`,
              borderRadius:    "0 0 10px 10px",
              zIndex:          200,
              maxHeight:       "320px",
              overflowY:       "auto",
              boxShadow:       "0 12px 40px rgba(0,0,0,0.15)",
            }}>
              {parts.map((part, i) => {
                const isSel  = selected?.id === part.id;
                const isLast = i === parts.length - 1;
                return (
                  <button
                    key={part.id}
                    onClick={() => choose(part)}
                    style={{
                      width:           "100%",
                      padding:         "13px 16px",
                      backgroundColor: isSel ? "rgba(45,100,100,0.1)" : "transparent",
                      border:          "none",
                      borderBottom:    isLast ? "none" : `1px solid ${C.border}`,
                      borderRadius:    isLast ? "0 0 10px 10px" : 0,
                      color:           isSel ? C.teal : C.body,
                      fontSize:        "17px",
                      fontFamily:      "system-ui",
                      fontWeight:      isSel ? 600 : 400,
                      textAlign:       "left",
                      cursor:          "pointer",
                      display:         "flex",
                      alignItems:      "center",
                      justifyContent:  "space-between",
                      transition:      "background 0.1s",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "9px", flex: 1, minWidth: 0 }}>
                      <CircNum n={i + 1} />
                      {part.title}
                    </span>
                    {isSel && (
                      <span style={{ color: C.teal, fontSize: "16px", flexShrink: 0 }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Invisible backdrop */}
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 199 }}
          />
        )}

        {/* Description panel */}
        {selected && (
          <div
            key={selected.id}
            style={{
              marginTop:       "16px",
              backgroundColor: C.card,
              border:          `1px solid ${C.border}`,
              borderLeft:      `3px solid ${C.teal}`,
              borderRadius:    "10px",
              padding:         "20px",
              animation:       "fadeIn 0.2s ease",
              position:        "relative",
            }}
          >
            <button
              onClick={() => setSelected(null)}
              title="Close"
              style={{
                position:     "absolute",
                top:          "12px",
                right:        "12px",
                background:   "none",
                border:       "none",
                color:        C.faint,
                fontSize:     "18px",
                cursor:       "pointer",
                lineHeight:   1,
                padding:      "2px 6px",
                borderRadius: "6px",
              }}
            >
              ✕
            </button>
            <h2 style={{
              color:        C.teal,
              fontSize:     "21px",
              fontWeight:   700,
              margin:       "0 0 10px 0",
              fontFamily:   "system-ui",
              paddingRight: "28px",
            }}>
              {selected.title}
            </h2>
            <p style={{
              color:      C.body,
              lineHeight: 1.75,
              margin:     0,
              fontSize:   "17px",
              whiteSpace: "pre-line",
              fontFamily: "system-ui",
            }}>
              {selected.description}
            </p>
          </div>
        )}

        {children}

      </div>
    </div>
  );
}
