"use client";
import { useState } from "react";

interface Part {
  id:          string;
  title:       string;
  description: string;
}

const PARTS: Part[] = [
  {
    id: "af-assist",
    title: "AF-Assist Illuminator",
    description: `A small lamp on the front of the camera that lights up automatically in dark conditions so the autofocus system can "see" your subject clearly enough to lock on.

• Activates when you press the shutter halfway in dim light.
• Working range: about 0.5–3.0 m (roughly 1½ to 10 feet) — most useful for nearby subjects indoors.
• Does NOT work in Continuous AF mode, Manual Focus mode, Landscape mode, or Sports mode.
• The centre focus point must be active for it to light up.
• You can turn it off in Custom Setting 09 (AF-assist) — handy if you don't want to disturb a sleeping baby or a shy animal.

Tip: If you're using a lens hood, remove it when the AF-assist lamp is on — the hood can cast a shadow and make focusing harder.`,
  },
  {
    id: "battery-cover",
    title: "Battery-Chamber Cover",
    description: `The hinged plastic door on the bottom of the camera that opens to let you insert or remove the rechargeable EN-EL9 battery.

• To open it: slide the battery-chamber cover latch (the small catch next to the door) and the cover swings open.
• Always confirm the camera is turned OFF before opening.
• Check that the memory card access lamp is off first — if it's still lit, the camera is saving a photo and opening the cover could cause you to lose it.
• Insert the battery with the metal contacts facing down, as shown by the diagram inside the camera body.
• Close and secure the latch firmly before shooting.

Tip: Carry a second charged battery. Cold weather drains batteries much faster than normal — on a winter day you may need a fresh one sooner than you'd expect.`,
  },
  {
    id: "card-lamp",
    title: "Card Access Lamp",
    description: `A small indicator light near the memory card slot. It lights up or blinks whenever the camera is actively reading from or writing data to the memory card.

• It lights briefly when you insert a card, confirming it's been detected.
• It lights after every shot while the image is being saved.
• ⚠️ NEVER open the card slot cover, open the battery door, or remove the battery while this lamp is lit — doing so can corrupt or permanently destroy your saved photos.
• Always wait for the lamp to go completely dark before touching the card or battery.

Tip: Make it a habit to glance at the access lamp before putting the camera away. It takes one second and can save you from losing a great shot.`,
  },
  {
    id: "card-slot",
    title: "Card Slot Cover",
    description: `The hinged door on the side of the camera that protects the slot where your SD memory card lives.

• Always turn the camera OFF and confirm the access lamp is off before opening.
• To insert: slide the card in — label facing the back of the camera — until it clicks.
• To remove: gently press the card inward. It pops out slightly so you can grip and pull it free.
• Keep this cover closed whenever you're not swapping cards.

Tip: Before using a brand new memory card for the first time, format it inside the camera: Setup Menu → Format memory card. This prepares it properly and avoids potential errors.`,
  },
  {
    id: "command-dial",
    title: "Command Dial",
    description: `The round rotating wheel on the upper-back-right of the camera, operated with your right thumb. You'll use it constantly — it's how you quickly change key exposure settings.

Used alone:
• S mode: rotate to change shutter speed.
• A mode: rotate to change aperture.
• M mode: rotate to change shutter speed; hold the Exposure Compensation button (A) at the same time to change aperture.
• P mode: rotate to shift the shutter speed / aperture combination while keeping the same overall exposure.

Used with other buttons:
• A + rotate: adjusts exposure compensation.
• Flash button + rotate: cycles through flash modes.
• Flash button + A + rotate: adjusts flash brightness.

During playback:
• Rotate to scroll forward and backward through your photos.
• While zoomed in, rotate to view the same area in a different photo.

Tip: Watch the Shooting Information Display while rotating — you'll see the numbers change in real time, which is a great way to understand what shutter speed and aperture actually mean.`,
  },
  {
    id: "delete",
    title: "Delete Button",
    description: `The trash-can button on the back of the camera. It permanently erases photos you don't want.

To delete a single photo:
1. Press the Playback button to view your photos.
2. When the unwanted photo is on screen, press the delete button once. A "Delete?" confirmation appears.
3. Press it a second time to confirm. Press Playback to cancel and keep the photo.

To delete multiple photos:
• In thumbnail view (press the zoom-out button for a grid of photos), highlight a photo and press delete.
• Or use the Playback Menu → Delete to erase groups of photos or an entire folder at once.

Important: Deletion is permanent — you cannot recover a deleted photo in the camera.

Tip: If you're unsure about a photo, use the Protect button to mark it safe rather than deleting it. Review your shots on a computer screen later — what looks slightly off on a small screen sometimes turns out to be your best shot.`,
  },
  {
    id: "diopter",
    title: "Diopter Adjustment Control",
    description: `A small sliding lever right beside the viewfinder eyepiece. It adjusts the optical focus of the viewfinder to suit your individual eyesight — like adjusting binoculars for your eyes.

• If the focus points, numbers, and indicators inside the viewfinder look blurry, you need to adjust this.
• To adjust: remove the lens cap so the viewfinder is active, look through it, then slide the diopter lever up or down until everything inside looks sharp and crisp.
• You're only adjusting what you see through the viewfinder — not the focus of the actual photo.
• Take care not to put your fingers near your eye while adjusting.
• Once set for your eyes, you won't need to change it again — unless someone else with different eyesight uses your camera.

Tip: If you can't get the viewfinder sharp at either extreme of the diopter range, Nikon makes optional correction lenses that attach to the eyepiece for stronger prescriptions.`,
  },
  {
    id: "eye-sensor",
    title: "Eye Sensor",
    description: `A small automatic sensor just below the viewfinder eyepiece. It detects when your face gets close to the viewfinder and manages the camera's displays automatically.

• When you raise the camera to your eye, the sensor detects your face and turns OFF the LCD monitor — and turns ON the viewfinder display instead. This saves battery.
• When you lower the camera, the monitor's shooting information display turns back on.
• This feature is controlled in Setup Menu → Shooting info auto off.
  - On (default): eye sensor is active.
  - Off: eye sensor is disabled.

Tip: If you notice the monitor turning off unexpectedly, check whether your hand, camera strap, or another object is accidentally covering the eye sensor. Adjust your grip or strap position to fix it.`,
  },
  {
    id: "flash",
    title: "Flash, Built-in",
    description: `The pop-up flash built into the top of the camera. It adds light when shooting in dark conditions or when your subject is backlit (bright light source behind them).

In Auto and scene modes (Portrait, Child, Night Portrait, etc.):
• The flash pops up automatically when needed as you half-press the shutter.
• Wait for the flash-ready indicator in the viewfinder before pressing all the way down, or the photo may be too dark.
• When done, gently press the flash head down until it clicks closed.

In advanced modes (P, S, A, M):
• The flash does NOT pop up automatically — press the Flash button on the front of the camera to raise it manually.
• Hold the Flash button and rotate the command dial to choose different flash modes.

Key facts:
• Flash cannot be used in Sports, Landscape, or Auto Flash Off modes.
• Minimum range: about 60 cm (2 ft) — subjects closer than that can appear washed out.
• Remove lens hoods when using flash to avoid unwanted shadows.
• The flash needs a moment to recharge between shots.

Tip: On sunny days, try using the flash on a person who is standing in shadow or with the sun behind them. This "fill flash" brightens their face and is a technique professional photographers use all the time.`,
  },
  {
    id: "flash-button",
    title: "Flash Button",
    description: `The button on the front-left of the camera body. In the advanced shooting modes (P, S, A, M), the built-in flash doesn't pop up on its own — you use this button to raise it when you want to use flash.

• Press it once to pop the flash up. Once raised, the flash fires with every shot until you close it.
• To close the flash: press it gently downward until it clicks back in place.
• To change flash mode: hold this button and rotate the command dial. You can cycle through Fill Flash, Red-Eye Reduction, Slow Sync, and Rear-Curtain Sync.
• To adjust flash brightness: hold this button + the Exposure Compensation button (A) at the same time, and rotate the command dial. Range is –3 to +1 stops.

Tip: In a bright outdoor portrait where the subject's face is in shadow, raise the flash with this button and shoot. The flash adds just enough light to the face without making the photo look like a harsh flash shot.`,
  },
  {
    id: "focal-scale",
    title: "Focal Length Scale",
    description: `The row of numbers printed on the zoom lens barrel (for example: 18, 24, 35, 45, 55 on the 18–55mm lens). They indicate the current focal length in millimetres as you zoom.

• The number aligned with the small index mark on the lens is the focal length you're currently at.
• Short focal lengths (e.g. 18mm) = wide-angle: more of the scene fits in the frame. Great for landscapes and groups.
• Long focal lengths (e.g. 55mm) = telephoto: subjects appear larger and more magnified. Great for portraits.
• Because the D60's sensor is smaller than 35mm film, every focal length looks about 1.5× longer than it would on a traditional film camera. So 55mm on your D60 acts more like 82mm.
• Longer focal lengths also blur the background more behind your subject — great for portraits.

Tip: Try spending a day shooting only at 18mm, then another day only at 55mm. Comparing the results teaches you more about focal length than any textbook.`,
  },
  {
    id: "lens-index",
    title: "Lens Mounting Index",
    description: `A small coloured alignment dot found on both the camera body and on each lens. Its job is to help you correctly orient and attach the lens.

To attach a lens:
1. Line up the dot on the lens with the matching dot on the camera body.
2. Insert the lens into the bayonet mount on the front of the camera.
3. Rotate the lens counter-clockwise (to the left, as seen from the front) until you feel and hear a firm click. It's now locked.

To remove a lens:
1. Press and hold the lens-release button on the front of the camera.
2. Rotate the lens clockwise (to the right, as seen from the front) until it comes free.

• Always turn the camera OFF before attaching or removing any lens.
• Keep the body cap on the camera and the rear lens cap on the lens whenever no lens is mounted.

Tip: When changing lenses outdoors, do it quickly in a sheltered spot away from wind and dust. Hold the camera with the lens mount tilted slightly downward so dust is less likely to fall onto the sensor.`,
  },
  {
    id: "menu",
    title: "Menu Button",
    description: `The MENU button on the back of the camera. Pressing it opens the full menu system where you can access virtually all of the D60's detailed settings.

The five menu sections:
• Playback Menu: manage and delete photos, slide shows, print settings.
• Shooting Menu: image quality and size, white balance, ISO, noise reduction, Active D-Lighting.
• Custom Settings: personalise autofocus behaviour, button assignments, timers, beep sounds, and more.
• Setup Menu: format the memory card, set date and time, language, LCD brightness, and other basic settings.
• Retouch Menu: edit copies of photos directly in the camera — crop, fix red-eye, apply filters — without needing a computer.

How to navigate:
• Multi selector up/down: move between items.
• Multi selector right: enter a sub-menu or confirm a selection.
• Multi selector left: go back.
• Press MENU again, or half-press the shutter, to exit.
• Grey (dimmed) menu items aren't available in the current mode — switch to P, S, A, or M to unlock more options.

Tip: Start with the Setup Menu — it's where you set the date, time, language, and format the memory card. Getting those right first makes everything else much easier.`,
  },
  {
    id: "mode-dial",
    title: "Mode Dial",
    description: `The large rotating dial on the top of the camera. It's the most important control — it decides how much creative control you have over the exposure.

Scene modes — camera handles most decisions:
• AUTO — Fully automatic. Camera controls everything. Best starting point.
• AUTO (flash off) — Same as Auto but flash is always off. Use in museums or concerts.
• Portrait — Softens skin tones and blurs the background.
• Landscape — Boosts colour vividness for outdoor scenes; flash turns off automatically.
• Child — Natural skin with vivid backgrounds. Great for snapshots of children.
• Sports — Fast shutter speeds to freeze moving subjects; camera focuses continuously.
• Close Up — Sharpens small nearby subjects like flowers or insects.
• Night Portrait — Combines flash with a slow shutter for natural-looking low-light portraits.

Advanced modes — you choose the settings:
• P (Programmed Auto) — Camera picks shutter speed and aperture; you can nudge the combination.
• S (Shutter-Priority) — You set the shutter speed; camera picks the aperture. Use to freeze or blur motion.
• A (Aperture-Priority) — You set the aperture; camera picks the shutter speed. Controls background blur.
• M (Manual) — You control both shutter speed and aperture yourself. Full creative freedom.

Tip: Start in AUTO to get comfortable. When you're ready, try A (Aperture-Priority) — set f/3.5 for blurry backgrounds in portraits, or f/16 to keep everything sharp in a landscape.`,
  },
  {
    id: "monitor",
    title: "Monitor (LCD Screen)",
    description: `The colour LCD screen on the back of the camera. It's your main display for reviewing photos and navigating settings. Note: the D60 does NOT support live view — you can't use the monitor to frame shots. You must use the viewfinder for that.

What it shows:
• Shooting Information Display: current settings at a glance — shutter speed, aperture, ISO, battery level, shots remaining, flash mode, and more. Press the Playback Zoom / Info button to cycle through: full info → quick settings → monitor off.
• Image Review: right after taking a shot, the photo briefly appears on screen so you can check it.
• Playback: press the Playback button to browse your photos.
• Menus: pressing MENU or other function buttons shows the camera's menus.

Adjusting the monitor:
• Brightness: Setup Menu → LCD Brightness. Choose from seven levels (–3 darkest to +3 brightest).
• Auto-off: the monitor turns off after a period of inactivity to save battery. Adjust timing in Custom Setting 15 (Auto off timers).

Tip: In bright sunlight the monitor can be nearly impossible to read. Temporarily boost brightness to +3, or rely on the viewfinder for composing and use the monitor only for reviewing shots afterward.`,
  },
  {
    id: "multi-selector",
    title: "Multi Selector",
    description: `The small four-way directional pad on the back of the camera (up, down, left, right). It works like a D-pad on a game controller and is your main navigation tool for menus, playback, and focus point selection.

While shooting — focus point selection:
• Press left or right to move the active focus point to one of the three positions in the viewfinder. Moving the focus point directly onto someone's eyes gives you much better portraits than always focusing in the centre.

In menus:
• Up/down: scroll through options.
• Right: enter a sub-menu or confirm a choice.
• Left: go back to the previous screen.

During playback:
• Left/right: view the previous or next photo.
• Up/down: cycle through information screens for the current photo (file info, shooting data, histogram, highlights).
• When zoomed into a photo: up/down/left/right pans around the zoomed image.

Tip: In playback, press up or down to access the histogram view. If the graph bunches up on the right edge, your photo is overexposed. On the left edge, it's underexposed. Learning to read histograms will make you a much better photographer.`,
  },
  {
    id: "playback",
    title: "Playback Button",
    description: `The triangular play button on the back of the camera. Press it to switch the camera into playback mode so you can view your photos on the monitor.

• Press it to display the most recently taken photo.
• Multi selector left/right, or the command dial: browse through other photos.
• Multi selector up/down: view different information screens for the current photo (shooting data, histogram, highlights, etc.).
• Playback Zoom button (K): zoom in on the photo for a closer look.
• Zoom Out button (M): switch to thumbnail view — see 4 or 9 smaller photos at once.
• Press Playback again, or half-press the shutter, to exit playback and return to shooting.
• Right after taking a shot, the photo appears on the monitor automatically. Press the shutter halfway during this review to instantly cancel it and shoot again without delay.

Tip: Make a habit of pressing Playback and zooming in right after important shots to check focus on your subject's eyes. It's the fastest way to know if you need to retake the shot while you're still there.`,
  },
  {
    id: "power",
    title: "Power Switch",
    description: `The rotating switch that surrounds the shutter-release button on the top of the camera. Rotate it to turn the camera on or off.

• Rotate to ON: the camera powers up. The monitor briefly shows an image sensor cleaning screen, then the Shooting Information Display appears.
• Rotate back to OFF: camera turns off.
• The camera has an Auto meter-off timer that turns off the viewfinder display after a period of inactivity (default 8 seconds) to save battery — but the camera is still on if the switch is in the ON position.
• Each time you turn the camera on or off, the Clean Image Sensor function briefly activates to shake dust off the sensor filter. This is normal.

Tip: Always turn the camera off when putting it away, even briefly. This conserves battery significantly and also prevents accidental shutter presses while the camera is in your bag.`,
  },
  {
    id: "shutter",
    title: "Shutter-Release Button",
    description: `The large button on the top-right of the camera that you press to take a photo. It's a two-stage button with two distinct actions.

Stage 1 — Press halfway (hold gently):
• Wakes up the exposure meters and viewfinder display.
• Triggers autofocus — the camera locks focus on your subject.
• When focus locks, a short beep sounds and a small dot (●) appears in the viewfinder. The active focus point lights up red.
• Exposure and focus stay locked while you hold the button halfway.
• If the focus indicator blinks instead of staying steady, the camera couldn't achieve focus — try again before pressing fully.

Stage 2 — Press all the way down:
• The shutter fires and the photograph is recorded.
• The memory card access lamp lights briefly as the image saves.

Other useful behaviours:
• Half-press wakes up the monitor and viewfinder display if they've gone dark.
• Half-press during image review instantly cancels the review so you can shoot again.

Tip: The most common beginner mistake is jabbing the button all the way down in one movement. Practice the deliberate half-press pause to let focus lock — your photos will be noticeably sharper.`,
  },
  {
    id: "usb",
    title: "USB Connector",
    description: `A small port on the camera body (protected by a rubber cap when not in use). It connects the camera to a computer or a compatible printer using the supplied USB cable.

Connecting to a computer:
• Turn the camera OFF, connect the USB cable, then turn the camera ON. The computer detects the camera and Nikon Transfer software can copy your photos.
• Do not turn the camera off or unplug the cable while photos are being transferred — this can corrupt files.

Connecting to a printer (PictBridge):
• Turn the printer on first, then connect the USB cable (camera off), then turn the camera on.
• The PictBridge screen appears and you can select and print photos directly from the camera without a computer.

Care:
• Always orient the connector correctly before inserting — never force it.
• Keep the rubber protective cap on when not in use to prevent dust and damage.

Tip: For faster photo transfers, use a memory card reader plugged into your computer's USB port instead of connecting the camera directly. Card readers are inexpensive, fast, and don't drain your camera battery during the transfer.`,
  },
  {
    id: "viewfinder",
    title: "Viewfinder Eyepiece",
    description: `The small rectangular window at the back of the camera that you press your eye against to compose your shots. It's surrounded by a soft rubber eyecup that makes it comfortable against your face and blocks distracting light from the sides.

• When you look through the viewfinder, the eye sensor detects your face, the monitor turns off, and the viewfinder display turns on — showing focus points, shutter speed, aperture, battery level, and other shooting indicators.
• The viewfinder shows three focus points (small brackets). When focus locks, the active focus point lights up red.
• If the viewfinder looks blurry, use the Diopter Adjustment Control (the small slider right beside the eyepiece) to tune it for your eyes.
• An Eyepiece Cap (DK-5) is included in the box — attach it over the eyepiece when using the self-timer without your eye at the viewfinder, as stray light entering through the eyepiece can throw off the exposure meter.

Tip: Press the camera body firmly against your brow and nose when shooting. This physical contact dramatically reduces camera shake and produces sharper photos than holding the camera away from your face.`,
  },
  {
    id: "zoom-ring",
    title: "Zoom Ring",
    description: `The larger rotating ring on the lens barrel (on the 18–55mm kit lens, it's the ring closest to the camera body). Turning it adjusts the focal length — zooming in to make subjects appear larger, or zooming out to show a wider view.

• Rotate away from the camera body (toward the front of the lens) to zoom in to a longer focal length (e.g., 55mm) — your subject fills more of the frame.
• Rotate toward the camera body to zoom out to a shorter focal length (e.g., 18mm) — you see a wider angle with more of the scene in the frame.
• Watch the Focal Length Scale on the lens barrel to see the current focal length as you rotate.
• On the kit lens, the maximum aperture changes as you zoom: f/3.5 at 18mm, f/5.6 at 55mm — this is normal for this type of lens.
• After zooming, always half-press the shutter again to re-confirm autofocus before shooting — zooming doesn't automatically update focus.
• The other ring on the lens (the narrower one closer to the front) is the Focus Ring — don't confuse the two.

Tip: Instead of always zooming to frame a shot, try physically moving closer to your subject and using a shorter focal length. Moving in changes the perspective in an interesting way that zooming alone can't replicate.`,
  },
  {
    id: "zoom-out",
    title: "Zoom Out / Thumbnail Button",
    description: `The button marked with a minus magnifying glass on the back-left of the camera. It has two jobs depending on what you're doing.

During photo review:
• While viewing a photo full-screen, press once to shrink to a grid of 4 thumbnails. Press again to see 9 thumbnails at once — great for quickly finding the shot you want.
• Use the multi selector or command dial to highlight different photos in the grid.
• Press the Playback Zoom button (the plus magnifying glass) to reduce the number of thumbnails and return toward full-screen view.
• Press Q (playback zoom out cancel) to view the highlighted photo at full size.
• When zoomed into a photo: press this button to zoom back out incrementally.

In menus and while shooting — Help:
• Press and hold this button while a menu option is highlighted to display helpful explanatory text about that setting.
• If a warning indicator blinks in the viewfinder, press this button to see an explanation of the problem on the monitor.

Tip: Use thumbnail view when scanning through a large batch of photos — it's much faster than stepping through them one by one. Then press OK on the one you want to inspect at full size.`,
  },
  {
    id: "playback-zoom",
    title: "Playback Zoom / Info Button",
    description: `The button marked with a plus magnifying glass (and an i symbol) on the back-left of the camera. It has two very different jobs depending on what you're doing.

During photo review — Zoom In:
• Press to zoom into the photo. Press repeatedly to zoom in further — up to 25× on large images, 19× on medium, 13× on small.
• While zoomed in, use the multi selector (up, down, left, right) to pan around the image. Keep it held to scroll quickly.
• A small navigation window appears briefly in the corner showing the full photo with a yellow rectangle indicating the area you're looking at.
• Rotate the command dial while zoomed in to view the same area in a different photo.
• Press the Zoom Out button to zoom back out; press Q to return to full-frame view.

During thumbnail view:
• Press to reduce the number of thumbnails — from 9 back to 4, then from 4 back to one full-screen view.

During shooting — Shooting Info Display:
• Press to cycle the monitor through: Shooting Information Display → Quick Settings Display (where you can change ISO, white balance, flash mode, and more with just a few button presses) → Monitor Off.
• Also wakes up the monitor if the auto-off timer has turned it off.

Tip: After every important shoot, zoom in on key shots using this button and check that your subject's eyes are sharp. A photo that looks fine at thumbnail size can turn out to be slightly soft when examined closely — and finding out while you're still on location means you can take another shot.`,
  },
];

const SORTED_PARTS = [...PARTS].sort((a, b) => a.title.localeCompare(b.title));

export default function CameraInteractive() {
  const [selected, setSelected] = useState<Part | null>(null);
  const [isOpen, setIsOpen]     = useState(false);

  const choose = (part: Part) => {
    setSelected(part);
    setIsOpen(false);
  };

  return (
    <div>
      {/* Static camera diagram */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/camera-diagram.png"
        alt="Nikon D60 — Parts of the Camera"
        style={{
          width:        "100%",
          height:       "auto",
          display:      "block",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
        draggable={false}
      />

      {/* Dropdown label */}
      <p style={{
        color:         "#5a9e8e",
        fontSize:      "11px",
        margin:        "0 0 8px 0",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontWeight:    600,
      }}>
        Select a camera part
      </p>

      {/* Custom dropdown */}
      <div style={{ position: "relative" }}>

        {/* Trigger button */}
        <button
          onClick={() => setIsOpen(o => !o)}
          style={{
            width:           "100%",
            padding:         "14px 16px",
            backgroundColor: isOpen ? "#0d1a18" : "#0f1e1c",
            border:          isOpen ? "1px solid #6ee7b7" : "1px solid #1a3530",
            borderRadius:    isOpen ? "10px 10px 0 0" : "10px",
            color:           selected ? "#e8f8f2" : "#3a7a6a",
            fontSize:        "15px",
            fontFamily:      "system-ui",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "space-between",
            cursor:          "pointer",
            textAlign:       "left",
            transition:      "border 0.15s, background 0.15s",
          }}
        >
          <span>{selected ? selected.title : "Choose a part to learn about it…"}</span>
          <span style={{
            display:    "inline-block",
            fontSize:   "18px",
            color:      isOpen ? "#6ee7b7" : "#3a7a6a",
            transform:  isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease, color 0.15s",
            marginLeft: "8px",
            flexShrink: 0,
          }}>
            ›
          </span>
        </button>

        {/* Dropdown list */}
        {isOpen && (
          <div style={{
            position:        "absolute",
            top:             "100%",
            left:            0,
            right:           0,
            backgroundColor: "#0f1e1c",
            border:          "1px solid #6ee7b7",
            borderTop:       "1px solid #1a3530",
            borderRadius:    "0 0 10px 10px",
            zIndex:          200,
            maxHeight:       "320px",
            overflowY:       "auto",
            boxShadow:       "0 12px 40px rgba(0,0,0,0.7)",
          }}>
            {SORTED_PARTS.map((part, i) => {
              const isSelected = selected?.id === part.id;
              const isLast     = i === SORTED_PARTS.length - 1;
              return (
                <button
                  key={part.id}
                  onClick={() => choose(part)}
                  style={{
                    width:           "100%",
                    padding:         "13px 16px",
                    backgroundColor: isSelected ? "rgba(110,231,183,0.12)" : "transparent",
                    border:          "none",
                    borderBottom:    isLast ? "none" : "1px solid #0d1a18",
                    borderRadius:    isLast ? "0 0 10px 10px" : 0,
                    color:           isSelected ? "#6ee7b7" : "#a8d4c4",
                    fontSize:        "14px",
                    fontFamily:      "system-ui",
                    fontWeight:      isSelected ? 600 : 400,
                    textAlign:       "left",
                    cursor:          "pointer",
                    display:         "flex",
                    alignItems:      "center",
                    justifyContent:  "space-between",
                    transition:      "background 0.1s",
                  }}
                >
                  {part.title}
                  {isSelected && (
                    <span style={{ color: "#6ee7b7", fontSize: "16px", flexShrink: 0 }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Invisible backdrop to close dropdown on outside click */}
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
            backgroundColor: "#0f1e1c",
            border:          "1px solid #1a3530",
            borderLeft:      "3px solid #6ee7b7",
            borderRadius:    "10px",
            padding:         "20px",
            animation:       "fadeIn 0.2s ease",
          }}
        >
          <h2 style={{
            color:      "#6ee7b7",
            fontSize:   "16px",
            fontWeight: 700,
            margin:     "0 0 10px 0",
            fontFamily: "system-ui",
          }}>
            {selected.title}
          </h2>
          <p style={{
            color:      "#a8d4c4",
            lineHeight: 1.75,
            margin:     0,
            fontSize:   "14px",
            whiteSpace: "pre-line",
            fontFamily: "system-ui",
          }}>
            {selected.description}
          </p>
        </div>
      )}
    </div>
  );
}
