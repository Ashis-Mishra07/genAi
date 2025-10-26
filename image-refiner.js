

const fs = require('fs');
const path = require('path');

// Comprehensive product detection function for ALL product types
function detectProductType(imagePath) {
  const fileName = path.basename(imagePath).toLowerCase();
  
  // CLOTHING & FASHION
  if (fileName.match(/\b(hoodie|hoody|sweatshirt|pullover)\b/)) return 'hoodie';
  if (fileName.match(/\b(t-?shirt|tee|top|tank)\b/)) return 'tshirt';
  if (fileName.match(/\b(shirt|blouse|button)\b/)) return 'shirt';
  if (fileName.match(/\b(dress|gown|sundress|maxi)\b/)) return 'dress';
  if (fileName.match(/\b(jacket|blazer|coat|cardigan)\b/)) return 'jacket';
  if (fileName.match(/\b(pants|jeans|trousers|slacks)\b/)) return 'pants';
  if (fileName.match(/\b(shoes|sneakers|boots|sandals|heels)\b/)) return 'shoes';
  if (fileName.match(/\b(hat|cap|beanie|fedora)\b/)) return 'hat';
  if (fileName.match(/\b(scarf|shawl|wrap|pashmina)\b/)) return 'scarf';
  if (fileName.match(/\b(socks|stockings|hosiery)\b/)) return 'socks';
  if (fileName.match(/\b(gloves|mittens)\b/)) return 'gloves';
  
  // JEWELRY & ACCESSORIES
  if (fileName.match(/\b(necklace|chain|pendant|choker)\b/)) return 'necklace';
  if (fileName.match(/\b(earrings|studs|hoops|dangles)\b/)) return 'earrings';
  if (fileName.match(/\b(bracelet|bangle|wristband)\b/)) return 'bracelet';
  if (fileName.match(/\b(ring|band|signet|wedding)\b/)) return 'ring';
  if (fileName.match(/\b(watch|timepiece|smartwatch)\b/)) return 'watch';
  if (fileName.match(/\b(brooch|pin|badge)\b/)) return 'brooch';
  if (fileName.match(/\b(cufflinks|tie.?clip)\b/)) return 'cufflinks';
  
  // BAGS & CARRIERS
  if (fileName.match(/\b(bag|purse|handbag|backpack|tote|clutch|satchel)\b/)) return 'bag';
  if (fileName.match(/\b(wallet|purse|billfold)\b/)) return 'wallet';
  if (fileName.match(/\b(luggage|suitcase|travel.?bag)\b/)) return 'luggage';
  
  // EYEWEAR
  if (fileName.match(/\b(sunglasses|glasses|eyewear|shades)\b/)) return 'sunglasses';
  if (fileName.match(/\b(eyeglasses|spectacles|reading.?glasses)\b/)) return 'eyeglasses';
  
  // POTTERY & CERAMICS
  if (fileName.match(/\b(pottery|ceramic|clay|pot|vessel)\b/)) return 'pottery';
  if (fileName.match(/\b(vase|urn|planter|flower.?pot)\b/)) return 'vase';
  if (fileName.match(/\b(bowl|dish|plate|serving)\b/)) return 'bowl';
  if (fileName.match(/\b(mug|cup|teacup|coffee.?mug)\b/)) return 'mug';
  if (fileName.match(/\b(pitcher|jug|water.?jug)\b/)) return 'pitcher';
  if (fileName.match(/\b(tile|ceramic.?tile|mosaic)\b/)) return 'ceramic_tile';
  
  // HOME DECOR & FURNISHINGS
  if (fileName.match(/\b(candle|candle.?holder|sconce)\b/)) return 'candle';
  if (fileName.match(/\b(lamp|light|lighting|table.?lamp)\b/)) return 'lamp';
  if (fileName.match(/\b(pillow|cushion|throw.?pillow)\b/)) return 'pillow';
  if (fileName.match(/\b(blanket|throw|quilt|coverlet)\b/)) return 'blanket';
  if (fileName.match(/\b(mirror|wall.?mirror|decorative.?mirror)\b/)) return 'mirror';
  if (fileName.match(/\b(frame|picture.?frame|photo.?frame)\b/)) return 'frame';
  if (fileName.match(/\b(clock|wall.?clock|desk.?clock)\b/)) return 'clock';
  if (fileName.match(/\b(basket|wicker|storage.?basket)\b/)) return 'basket';
  if (fileName.match(/\b(rug|carpet|mat|area.?rug)\b/)) return 'rug';
  if (fileName.match(/\b(curtains|drapes|window.?treatment)\b/)) return 'curtains';
  
  // ART & CRAFTS
  if (fileName.match(/\b(artwork|art|painting|canvas)\b/)) return 'artwork';
  if (fileName.match(/\b(sculpture|statue|figurine|carving)\b/)) return 'sculpture';
  if (fileName.match(/\b(print|poster|wall.?art)\b/)) return 'print';
  if (fileName.match(/\b(tapestry|wall.?hanging|textile.?art)\b/)) return 'tapestry';
  if (fileName.match(/\b(ornament|decoration|decorative)\b/)) return 'ornament';
  
  // WOOD & FURNITURE
  if (fileName.match(/\b(wood|wooden|timber|furniture)\b/)) return 'woodwork';
  if (fileName.match(/\b(chair|stool|seating)\b/)) return 'chair';
  if (fileName.match(/\b(table|desk|wooden.?table)\b/)) return 'table';
  if (fileName.match(/\b(cabinet|shelf|shelving|storage)\b/)) return 'cabinet';
  if (fileName.match(/\b(chest|trunk|box|wooden.?box)\b/)) return 'chest';
  
  // TEXTILES & FABRICS
  if (fileName.match(/\b(textile|fabric|weaving|woven)\b/)) return 'textile';
  if (fileName.match(/\b(embroidery|embroidered|needlework)\b/)) return 'embroidery';
  if (fileName.match(/\b(knit|knitted|crochet|yarn)\b/)) return 'knitted';
  if (fileName.match(/\b(silk|cotton|wool|linen)\b/)) return 'fabric';
  
  // GLASS & CRYSTAL
  if (fileName.match(/\b(glass|crystal|blown.?glass|glassware)\b/)) return 'glass';
  if (fileName.match(/\b(bottle|jar|container|vessel)\b/)) return 'glass_container';
  if (fileName.match(/\b(wine.?glass|champagne.?flute|tumbler)\b/)) return 'drinkware';
  
  // METAL & METALWORK
  if (fileName.match(/\b(metal|metalwork|bronze|copper|brass)\b/)) return 'metalwork';
  if (fileName.match(/\b(silver|gold|platinum|precious.?metal)\b/)) return 'precious_metal';
  if (fileName.match(/\b(iron|steel|forged|blacksmith)\b/)) return 'iron_work';
  
  // LEATHER & GOODS
  if (fileName.match(/\b(leather|hide|suede|leather.?goods)\b/)) return 'leather';
  if (fileName.match(/\b(belt|leather.?belt|strap)\b/)) return 'belt';
  
  // BEAUTY & PERSONAL CARE
  if (fileName.match(/\b(soap|handmade.?soap|natural.?soap)\b/)) return 'soap';
  if (fileName.match(/\b(skincare|lotion|cream|balm)\b/)) return 'skincare';
  if (fileName.match(/\b(perfume|fragrance|cologne|scent)\b/)) return 'perfume';
  if (fileName.match(/\b(cosmetics|makeup|beauty)\b/)) return 'cosmetics';
  
  // TOYS & GAMES
  if (fileName.match(/\b(toy|doll|stuffed.?animal|plush)\b/)) return 'toy';
  if (fileName.match(/\b(game|puzzle|board.?game)\b/)) return 'game';
  
  // MUSICAL INSTRUMENTS
  if (fileName.match(/\b(instrument|music|guitar|violin|flute)\b/)) return 'instrument';
  
  // BOOKS & STATIONERY
  if (fileName.match(/\b(book|journal|notebook|diary)\b/)) return 'book';
  if (fileName.match(/\b(pen|pencil|stationery|writing)\b/)) return 'stationery';
  
  // FOOD & KITCHEN
  if (fileName.match(/\b(spice|herbs|seasoning|condiment)\b/)) return 'spices';
  if (fileName.match(/\b(honey|jam|preserve|sauce)\b/)) return 'food_product';
  if (fileName.match(/\b(tea|coffee|beverage|drink)\b/)) return 'beverage';
  
  // TOOLS & IMPLEMENTS
  if (fileName.match(/\b(tool|hammer|chisel|craft.?tool)\b/)) return 'tool';
  if (fileName.match(/\b(knife|blade|cutting|kitchen.?knife)\b/)) return 'knife';
  
  return 'general';
}

// Get photoshoot concept based on product type - COMPREHENSIVE COVERAGE
function getPhotoshootConcept(productType) {
  const concepts = {
    // CLOTHING & FASHION
    hoodie: {
      modelType: 'casual streetwear model',
      setting: 'urban street backdrop with natural lighting',
      poses: 'walking casually, hands in pockets, confident stance',
      style: 'lifestyle street photography',
      prompt: 'Professional fashion photoshoot featuring a model wearing a stylish hoodie, urban street setting, model walking casually, natural candid poses, city backdrop, natural street lighting, authentic urban aesthetic, casual styling, real-world context'
    },
    
    tshirt: {
      modelType: 'casual fashion model',
      setting: 'outdoor natural setting or clean studio',
      poses: 'relaxed natural poses, everyday fashion context',
      style: 'lifestyle photography',
      prompt: 'Professional fashion photoshoot with a model wearing a stylish t-shirt, casual outdoor setting, model in relaxed natural poses, everyday fashion context, natural daylight, casual authentic styling'
    },
    
    shirt: {
      modelType: 'professional business model',
      setting: 'office or sophisticated indoor setting',
      poses: 'professional casual poses, business context',
      style: 'business lifestyle photography',
      prompt: 'Professional fashion photoshoot with a model wearing an elegant dress shirt, sophisticated office environment, model in professional casual poses, business casual context, natural professional lighting'
    },
    
    dress: {
      modelType: 'elegant fashion model',
      setting: 'beautiful outdoor location or studio',
      poses: 'graceful flowing poses, romantic lighting',
      style: 'fashion photography',
      prompt: 'Elegant fashion photoshoot featuring a model wearing the beautiful dress, beautiful outdoor location, model in graceful natural poses, romantic golden hour lighting, elegant natural poses'
    },
    
    necklace: {
      modelType: 'elegant jewelry model',
      setting: 'portrait studio with soft lighting',
      poses: 'portrait shots, necklace as focal point',
      style: 'jewelry photography',
      prompt: 'Professional jewelry photoshoot featuring a model wearing the elegant necklace, elegant portrait setting, model in natural graceful poses, necklace as the focal point, soft natural portrait lighting'
    },
    
    bag: {
      modelType: 'street style fashion model',
      setting: 'urban street or lifestyle setting',
      poses: 'carrying bag naturally, street style poses',
      style: 'accessory photography',
      prompt: 'Professional accessory photoshoot featuring a model with the stylish bag, urban street style setting, model carrying bag naturally, everyday fashion lifestyle context, street style aesthetic'
    },
    
    shoes: {
      modelType: 'active lifestyle model',
      setting: 'urban or natural outdoor environment',
      poses: 'walking or standing naturally',
      style: 'footwear photography',
      prompt: 'Professional footwear photoshoot featuring a model wearing the stylish shoes, urban outdoor setting, model walking naturally, shoes in real-world context, natural lighting'
    },
    
    jacket: {
      modelType: 'fashion model',
      setting: 'outdoor urban setting',
      poses: 'natural poses showing layered styling',
      style: 'outerwear photography',
      prompt: 'Professional outerwear photoshoot featuring a model wearing the jacket, outdoor urban setting, model in natural poses, layered styling context, fashion lighting emphasizing texture'
    },
    
    pants: {
      modelType: 'casual fashion model',
      setting: 'urban setting',
      poses: 'natural walking poses',
      style: 'fashion photography',
      prompt: 'Professional fashion photoshoot with a model wearing the stylish pants, casual urban setting, model in natural walking poses, everyday fashion context, natural fashion lighting'
    },
    
    hat: {
      modelType: 'street style model',
      setting: 'urban outdoor setting',
      poses: 'casual confident poses',
      style: 'accessory photography',
      prompt: 'Professional accessory photoshoot with a model wearing the stylish hat, urban setting, model in casual confident poses, street style context, natural lighting'
    },
    
    watch: {
      modelType: 'professional model',
      setting: 'clean studio or urban setting',
      poses: 'poses showing watch prominently',
      style: 'accessory photography',
      prompt: 'Professional accessory photoshoot featuring a model wearing the elegant watch, clean professional setting, model poses showing watch prominently, luxury accessory presentation'
    },
    
    // JEWELRY & ACCESSORIES (extended)
    earrings: {
      modelType: 'elegant jewelry model',
      setting: 'portrait studio with soft lighting',
      poses: 'profile and three-quarter poses showcasing earrings',
      style: 'jewelry photography',
      prompt: 'Professional jewelry photoshoot featuring a model wearing elegant earrings, portrait studio setting, model in graceful profile poses, earrings as focal point, soft studio lighting, luxury jewelry presentation'
    },
    
    bracelet: {
      modelType: 'elegant hand model',
      setting: 'clean studio with luxury backdrop',
      poses: 'hand and wrist poses showcasing bracelet',
      style: 'jewelry photography',
      prompt: 'Professional jewelry photoshoot featuring a model wearing an elegant bracelet, clean luxury studio, model showing graceful hand poses, bracelet prominently displayed, soft jewelry lighting'
    },
    
    ring: {
      modelType: 'hand model',
      setting: 'luxury jewelry studio',
      poses: 'detailed hand poses highlighting ring',
      style: 'fine jewelry photography',
      prompt: 'Professional fine jewelry photoshoot featuring a model wearing an elegant ring, luxury studio setting, detailed hand poses, ring as centerpiece, macro jewelry lighting, luxury presentation'
    },
    
    brooch: {
      modelType: 'elegant fashion model',
      setting: 'sophisticated studio or vintage setting',
      poses: 'formal poses with brooch on lapel or dress',
      style: 'vintage-inspired jewelry photography',
      prompt: 'Professional vintage-style photoshoot featuring a model wearing an elegant brooch, sophisticated setting, model in formal poses, brooch elegantly positioned, classic lighting'
    },
    
    cufflinks: {
      modelType: 'professional male model',
      setting: 'luxury menswear studio',
      poses: 'formal business poses showing cufflinks',
      style: 'menswear accessory photography',
      prompt: 'Professional menswear photoshoot featuring a model wearing elegant cufflinks, luxury business setting, formal poses, cufflinks prominently displayed, sophisticated lighting'
    },
    
    sunglasses: {
      modelType: 'fashion lifestyle model',
      setting: 'outdoor sunny location or modern studio',
      poses: 'confident poses wearing sunglasses',
      style: 'lifestyle fashion photography',
      prompt: 'Professional lifestyle photoshoot featuring a model wearing stylish sunglasses, outdoor sunny setting, confident fashion poses, sunglasses as statement piece, natural bright lighting'
    },
    
    eyeglasses: {
      modelType: 'professional or intellectual model',
      setting: 'modern office or library setting',
      poses: 'professional poses highlighting eyewear',
      style: 'professional lifestyle photography',
      prompt: 'Professional lifestyle photoshoot featuring a model wearing elegant eyeglasses, modern professional setting, intellectual poses, eyeglasses enhancing professional look, natural lighting'
    },
    
    scarf: {
      modelType: 'elegant fashion model',
      setting: 'outdoor autumn setting or studio',
      poses: 'graceful poses showcasing scarf styling',
      style: 'accessory fashion photography',
      prompt: 'Professional fashion photoshoot featuring a model wearing an elegant scarf, beautiful setting, graceful poses showing scarf versatility, accessory styling focus, soft natural lighting'
    },
    
    wallet: {
      modelType: 'lifestyle model',
      setting: 'urban professional setting',
      poses: 'everyday poses using wallet naturally',
      style: 'lifestyle product photography',
      prompt: 'Professional lifestyle photoshoot featuring a model with a stylish wallet, urban setting, natural everyday poses, wallet in real-world context, authentic lifestyle presentation'
    },
    
    // POTTERY & CERAMICS
    pottery: {
      modelType: 'artisan potter or lifestyle model',
      setting: 'pottery studio or rustic home setting',
      poses: 'hands working with clay or displaying finished piece',
      style: 'artisan craft photography',
      prompt: 'Professional artisan photoshoot featuring pottery creation, authentic pottery studio, model working with clay or displaying finished ceramic piece, rustic natural lighting, craft authenticity focus'
    },
    
    vase: {
      modelType: 'home lifestyle model',
      setting: 'elegant home interior with natural lighting',
      poses: 'arranging flowers in vase, home styling',
      style: 'home lifestyle photography',
      prompt: 'Professional home lifestyle photoshoot featuring an elegant vase, beautiful interior setting, model arranging fresh flowers, vase as centerpiece, natural home lighting, authentic home styling'
    },
    
    bowl: {
      modelType: 'lifestyle model or hands-only',
      setting: 'kitchen or dining room setting',
      poses: 'using bowl for food presentation or table setting',
      style: 'lifestyle product photography',
      prompt: 'Professional lifestyle photoshoot featuring handcrafted bowl, authentic kitchen setting, model using bowl for food presentation, natural dining context, warm home lighting'
    },
    
    mug: {
      modelType: 'lifestyle model',
      setting: 'cozy cafe or home kitchen',
      poses: 'drinking coffee, morning routine poses',
      style: 'lifestyle product photography',
      prompt: 'Professional lifestyle photoshoot featuring artisan mug, cozy cafe setting, model enjoying morning coffee, mug in natural use context, warm comfortable lighting, authentic daily moments'
    },
    
    pitcher: {
      modelType: 'home lifestyle model',
      setting: 'dining room or kitchen',
      poses: 'pouring water or arranging table setting',
      style: 'home lifestyle photography',
      prompt: 'Professional home photoshoot featuring elegant pitcher, dining setting, model using pitcher for table service, functional beauty focus, natural home lighting'
    },
    
    ceramic_tile: {
      modelType: 'interior design model or hands-only',
      setting: 'modern bathroom or kitchen',
      poses: 'touching or showcasing tile installation',
      style: 'interior design photography',
      prompt: 'Professional interior design photoshoot featuring ceramic tiles, modern space, model showcasing tile craftsmanship, architectural beauty focus, clean modern lighting'
    },
    
    // HOME DECOR & FURNISHINGS
    candle: {
      modelType: 'lifestyle model',
      setting: 'cozy home interior with warm ambiance',
      poses: 'lighting candle, relaxing evening poses',
      style: 'lifestyle ambiance photography',
      prompt: 'Professional lifestyle photoshoot featuring artisan candles, cozy home setting, model creating warm ambiance, candles providing atmospheric lighting, intimate comfortable mood'
    },
    
    lamp: {
      modelType: 'interior lifestyle model',
      setting: 'stylish home interior',
      poses: 'reading by lamplight, home evening routine',
      style: 'home lifestyle photography',
      prompt: 'Professional home photoshoot featuring elegant lamp, stylish interior, model reading in lamp light, functional home lighting showcased, warm evening atmosphere'
    },
    
    pillow: {
      modelType: 'home lifestyle model',
      setting: 'cozy living room or bedroom',
      poses: 'relaxing with pillows, comfort poses',
      style: 'home comfort photography',
      prompt: 'Professional lifestyle photoshoot featuring decorative pillows, cozy home setting, model relaxing comfortably, pillows enhancing home comfort, soft natural lighting'
    },
    
    blanket: {
      modelType: 'lifestyle model',
      setting: 'cozy home interior or outdoor setting',
      poses: 'wrapped in blanket, comfort and warmth poses',
      style: 'comfort lifestyle photography',
      prompt: 'Professional comfort photoshoot featuring handcrafted blanket, cozy setting, model wrapped warmly, blanket providing comfort, soft warm lighting, hygge aesthetic'
    },
    
    mirror: {
      modelType: 'lifestyle model',
      setting: 'elegant bedroom or bathroom',
      poses: 'using mirror for daily routine, reflection poses',
      style: 'lifestyle interior photography',
      prompt: 'Professional interior photoshoot featuring decorative mirror, elegant room setting, model using mirror naturally, functional beauty combined, natural room lighting'
    },
    
    frame: {
      modelType: 'lifestyle model or hands-only',
      setting: 'home interior wall',
      poses: 'hanging or adjusting framed artwork',
      style: 'home styling photography',
      prompt: 'Professional home styling photoshoot featuring elegant frame, interior wall setting, model arranging framed artwork, home personalization focus, natural interior lighting'
    },
    
    clock: {
      modelType: 'lifestyle model',
      setting: 'home office or living room',
      poses: 'checking time, daily routine context',
      style: 'lifestyle product photography',
      prompt: 'Professional lifestyle photoshoot featuring artisan clock, home setting, model in daily routine, timepiece as functional art, natural home lighting'
    },
    
    basket: {
      modelType: 'lifestyle model',
      setting: 'home laundry room or storage area',
      poses: 'organizing with baskets, home organization',
      style: 'home organization photography',
      prompt: 'Professional home organization photoshoot featuring woven baskets, organized home setting, model using baskets functionally, practical beauty focus, clean natural lighting'
    },
    
    rug: {
      modelType: 'lifestyle model or feet-only',
      setting: 'stylish home interior',
      poses: 'walking on rug, barefoot comfort poses',
      style: 'home interior photography',
      prompt: 'Professional interior photoshoot featuring handwoven rug, stylish room setting, model walking comfortably, rug enhancing room warmth, natural interior lighting'
    },
    
    curtains: {
      modelType: 'lifestyle model',
      setting: 'bright window-lit room',
      poses: 'opening curtains, morning light poses',
      style: 'home interior photography',
      prompt: 'Professional interior photoshoot featuring elegant curtains, bright windowed room, model opening curtains to morning light, textile beauty in natural light, bright airy atmosphere'
    },
    
    // ART & CRAFTS
    artwork: {
      modelType: 'art enthusiast or gallery visitor',
      setting: 'gallery wall or home art display',
      poses: 'admiring artwork, contemplative poses',
      style: 'art appreciation photography',
      prompt: 'Professional art photoshoot featuring original artwork, gallery setting, model appreciating art piece, artistic contemplation mood, museum-quality lighting'
    },
    
    sculpture: {
      modelType: 'art model or hands-only',
      setting: 'gallery space or sculptural backdrop',
      poses: 'interacting with or admiring sculpture',
      style: 'sculptural art photography',
      prompt: 'Professional sculptural photoshoot featuring handcrafted sculpture, artistic space, model interacting with sculptural piece, three-dimensional art focus, dramatic artistic lighting'
    },
    
    print: {
      modelType: 'lifestyle model or hands-only',
      setting: 'wall display or framing context',
      poses: 'hanging or viewing print artwork',
      style: 'wall art photography',
      prompt: 'Professional wall art photoshoot featuring artistic print, interior wall setting, model arranging print display, printmaking craft appreciation, natural gallery lighting'
    },
    
    tapestry: {
      modelType: 'lifestyle model',
      setting: 'bohemian or artistic interior',
      poses: 'hanging or admiring wall tapestry',
      style: 'textile art photography',
      prompt: 'Professional textile art photoshoot featuring woven tapestry, artistic interior, model with wall hanging, textile craftsmanship focus, warm artistic lighting'
    },
    
    ornament: {
      modelType: 'lifestyle model or hands-only',
      setting: 'holiday home or decorative display',
      poses: 'placing ornaments, seasonal decorating',
      style: 'seasonal lifestyle photography',
      prompt: 'Professional seasonal photoshoot featuring decorative ornaments, festive home setting, model decorating space, ornamental beauty focus, warm celebratory lighting'
    },
    
    // WOOD & FURNITURE
    woodwork: {
      modelType: 'craftsperson or lifestyle model',
      setting: 'woodworking shop or rustic home',
      poses: 'working with wood or displaying finished piece',
      style: 'craft artisan photography',
      prompt: 'Professional woodworking photoshoot featuring handcrafted wood piece, authentic workshop, model with woodworking tools or finished piece, craftsmanship focus, natural workshop lighting'
    },
    
    chair: {
      modelType: 'lifestyle model',
      setting: 'home interior or outdoor space',
      poses: 'sitting comfortably, furniture use poses',
      style: 'furniture lifestyle photography',
      prompt: 'Professional furniture photoshoot featuring handcrafted chair, interior setting, model sitting comfortably, furniture functionality and beauty, natural room lighting'
    },
    
    table: {
      modelType: 'lifestyle model or hands-only',
      setting: 'dining room or workspace',
      poses: 'using table for dining or work',
      style: 'furniture lifestyle photography',
      prompt: 'Professional furniture photoshoot featuring wooden table, dining or work setting, model using table functionally, crafted furniture in daily life, natural room lighting'
    },
    
    cabinet: {
      modelType: 'lifestyle model',
      setting: 'organized home interior',
      poses: 'organizing items in cabinet, storage use',
      style: 'home organization photography',
      prompt: 'Professional home storage photoshoot featuring handcrafted cabinet, organized interior, model using storage functionally, functional furniture beauty, clean home lighting'
    },
    
    chest: {
      modelType: 'lifestyle model',
      setting: 'bedroom or storage area',
      poses: 'storing items in chest, organizing poses',
      style: 'storage furniture photography',
      prompt: 'Professional storage photoshoot featuring wooden chest, bedroom setting, model organizing belongings, traditional storage craftsmanship, warm home lighting'
    },
    
    // TEXTILES & FABRICS
    textile: {
      modelType: 'textile artist or lifestyle model',
      setting: 'weaving studio or artistic space',
      poses: 'working with textiles or displaying fabric',
      style: 'textile craft photography',
      prompt: 'Professional textile photoshoot featuring handwoven fabric, craft studio, model working with textiles or showing fabric texture, fiber art focus, natural craft lighting'
    },
    
    embroidery: {
      modelType: 'craft enthusiast or hands-only',
      setting: 'craft studio or cozy home corner',
      poses: 'working on embroidery or displaying finished piece',
      style: 'needlework craft photography',
      prompt: 'Professional needlework photoshoot featuring embroidered piece, craft setting, model working on embroidery, detailed handwork focus, soft craft lighting'
    },
    
    knitted: {
      modelType: 'lifestyle model',
      setting: 'cozy home interior',
      poses: 'wearing or working with knitted items',
      style: 'cozy craft photography',
      prompt: 'Professional craft photoshoot featuring knitted item, cozy home setting, model with handknit piece, textile comfort and warmth, soft natural lighting'
    },
    
    fabric: {
      modelType: 'fashion designer or textile model',
      setting: 'design studio or fabric shop',
      poses: 'feeling fabric texture, examining material',
      style: 'textile material photography',
      prompt: 'Professional textile photoshoot featuring quality fabric, design studio, model examining fabric texture, material quality focus, professional fabric lighting'
    },
    
    // GLASS & CRYSTAL
    glass: {
      modelType: 'artisan glassblower or lifestyle model',
      setting: 'glass studio or elegant display',
      poses: 'creating or displaying glass art',
      style: 'glass art photography',
      prompt: 'Professional glass art photoshoot featuring blown glass piece, artistic studio, model with glass artwork, transparent beauty focus, dramatic glass lighting'
    },
    
    glass_container: {
      modelType: 'lifestyle model or hands-only',
      setting: 'kitchen or storage area',
      poses: 'using glass containers for storage',
      style: 'functional glass photography',
      prompt: 'Professional lifestyle photoshoot featuring glass containers, kitchen setting, model using containers functionally, practical glass beauty, natural kitchen lighting'
    },
    
    drinkware: {
      modelType: 'lifestyle model',
      setting: 'elegant dining or bar setting',
      poses: 'toasting or enjoying beverages',
      style: 'elegant dining photography',
      prompt: 'Professional dining photoshoot featuring elegant glassware, sophisticated table setting, model enjoying beverages, crystal clarity focus, elegant dining lighting'
    },
    
    // METAL & METALWORK
    metalwork: {
      modelType: 'metalworker or artisan model',
      setting: 'metalworking forge or display',
      poses: 'working metal or displaying finished piece',
      style: 'metalcraft photography',
      prompt: 'Professional metalwork photoshoot featuring forged metal piece, authentic forge setting, model with metalworking tools, craftsmanship strength focus, dramatic forge lighting'
    },
    
    precious_metal: {
      modelType: 'jewelry model',
      setting: 'luxury jewelry studio',
      poses: 'displaying precious metal items',
      style: 'luxury metalwork photography',
      prompt: 'Professional luxury photoshoot featuring precious metal piece, elegant studio, model showcasing metal beauty, precious material focus, sophisticated lighting'
    },
    
    iron_work: {
      modelType: 'blacksmith or industrial model',
      setting: 'blacksmith forge or industrial space',
      poses: 'forging iron or displaying ironwork',
      style: 'industrial craft photography',
      prompt: 'Professional blacksmith photoshoot featuring iron work, authentic forge, model with blacksmithing tools, industrial strength beauty, dramatic forge lighting'
    },
    
    // LEATHER & GOODS
    leather: {
      modelType: 'leather craftsperson or lifestyle model',
      setting: 'leather workshop or rustic setting',
      poses: 'working leather or wearing leather goods',
      style: 'leather craft photography',
      prompt: 'Professional leather craft photoshoot featuring handcrafted leather, workshop setting, model working with leather, traditional craftsmanship focus, warm workshop lighting'
    },
    
    belt: {
      modelType: 'fashion model',
      setting: 'fashion studio or lifestyle setting',
      poses: 'wearing belt as fashion accessory',
      style: 'fashion accessory photography',
      prompt: 'Professional fashion photoshoot featuring leather belt, fashion setting, model wearing belt stylishly, accessory functionality and style, professional fashion lighting'
    },
    
    // BEAUTY & PERSONAL CARE
    soap: {
      modelType: 'spa lifestyle model',
      setting: 'bathroom spa or natural setting',
      poses: 'using handmade soap, spa routine',
      style: 'spa lifestyle photography',
      prompt: 'Professional spa photoshoot featuring artisan soap, luxury bathroom, model in spa routine, natural skincare focus, soft spa lighting'
    },
    
    skincare: {
      modelType: 'beauty lifestyle model',
      setting: 'clean bathroom or spa setting',
      poses: 'applying skincare, beauty routine',
      style: 'beauty lifestyle photography',
      prompt: 'Professional beauty photoshoot featuring natural skincare, spa setting, model in skincare routine, healthy skin focus, soft beauty lighting'
    },
    
    perfume: {
      modelType: 'elegant lifestyle model',
      setting: 'luxury vanity or garden setting',
      poses: 'applying perfume, elegant grooming',
      style: 'luxury beauty photography',
      prompt: 'Professional fragrance photoshoot featuring artisan perfume, elegant setting, model applying fragrance, sensory luxury focus, sophisticated lighting'
    },
    
    cosmetics: {
      modelType: 'beauty model',
      setting: 'beauty studio or vanity',
      poses: 'applying makeup, beauty routine',
      style: 'beauty product photography',
      prompt: 'Professional beauty photoshoot featuring natural cosmetics, beauty studio, model in makeup routine, natural beauty enhancement, professional beauty lighting'
    },
    
    // SPECIALIZED ITEMS
    toy: {
      modelType: 'child model or family lifestyle',
      setting: 'playroom or family home',
      poses: 'playing with handmade toys',
      style: 'family lifestyle photography',
      prompt: 'Professional family photoshoot featuring handcrafted toy, playful home setting, child playing naturally, toy craftsmanship and joy, warm family lighting'
    },
    
    game: {
      modelType: 'lifestyle model or family',
      setting: 'game room or family gathering',
      poses: 'playing games together, social interaction',
      style: 'social lifestyle photography',
      prompt: 'Professional social photoshoot featuring handcrafted game, family setting, models playing together, social connection focus, warm gathering lighting'
    },
    
    instrument: {
      modelType: 'musician or music student',
      setting: 'music studio or performance space',
      poses: 'playing musical instrument',
      style: 'musical performance photography',
      prompt: 'Professional music photoshoot featuring handcrafted instrument, music studio, model playing instrument, musical craftsmanship, dramatic performance lighting'
    },
    
    book: {
      modelType: 'intellectual lifestyle model',
      setting: 'library or reading nook',
      poses: 'reading, contemplative learning poses',
      style: 'intellectual lifestyle photography',
      prompt: 'Professional reading photoshoot featuring handbound book, library setting, model reading thoughtfully, literary appreciation focus, warm reading lighting'
    },
    
    stationery: {
      modelType: 'professional or student model',
      setting: 'office or study space',
      poses: 'writing or organizing with stationery',
      style: 'professional lifestyle photography',
      prompt: 'Professional workspace photoshoot featuring handcrafted stationery, organized office, model working with quality stationery, productivity beauty focus, clean workspace lighting'
    },
    
    spices: {
      modelType: 'chef or cooking enthusiast',
      setting: 'kitchen or spice market',
      poses: 'cooking with spices, culinary preparation',
      style: 'culinary lifestyle photography',
      prompt: 'Professional culinary photoshoot featuring artisan spices, authentic kitchen, model cooking with spices, culinary craftsmanship focus, warm kitchen lighting'
    },
    
    food_product: {
      modelType: 'culinary lifestyle model',
      setting: 'kitchen or dining setting',
      poses: 'preparing or enjoying artisan food',
      style: 'food lifestyle photography',
      prompt: 'Professional food photoshoot featuring artisan food product, beautiful kitchen, model enjoying handcrafted food, culinary artistry focus, appetizing natural lighting'
    },
    
    beverage: {
      modelType: 'lifestyle model',
      setting: 'cafe or home kitchen',
      poses: 'preparing or enjoying artisan beverages',
      style: 'beverage lifestyle photography',
      prompt: 'Professional beverage photoshoot featuring artisan drink, cozy cafe, model enjoying handcrafted beverage, beverage culture focus, warm cafe lighting'
    },
    
    tool: {
      modelType: 'craftsperson or artisan',
      setting: 'workshop or craft space',
      poses: 'using handcrafted tools, working',
      style: 'craft tool photography',
      prompt: 'Professional craft photoshoot featuring handmade tools, authentic workshop, model using tools skillfully, craftsmanship utility focus, natural workshop lighting'
    },
    
    knife: {
      modelType: 'chef or culinary artist',
      setting: 'professional kitchen',
      poses: 'using knife for food preparation',
      style: 'culinary craft photography',
      prompt: 'Professional culinary photoshoot featuring handforged knife, chef kitchen, model using knife expertly, culinary precision focus, professional kitchen lighting'
    },
    
    general: {
      modelType: 'lifestyle model',
      setting: 'natural authentic setting',
      poses: 'natural poses with product',
      style: 'artisan product photography',
      prompt: 'Professional artisan photoshoot showcasing handcrafted item, authentic setting, model with artisan product, craftsmanship appreciation focus, natural authentic lighting'
    }
  };
  
  return concepts[productType] || concepts.general;
}

// Generate refined image using Pollinations AI
async function generateRefinedImage(imagePath, productType) {
  const concept = getPhotoshootConcept(productType);
  
  // Enhanced prompt for photoshoot-style image
  const enhancedPrompt = `${concept.prompt}, professional photography, high resolution, no text overlays, no watermarks, no logos, cinematic lighting, magazine quality, Instagram-worthy aesthetic, professional model, realistic photoshoot`;
  
  // Generate image URL
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1080&height=1080&seed=${Date.now()}&model=flux&enhance=true`;
  
  return {
    imageUrl: imageUrl,
    concept: concept,
    enhancedPrompt: enhancedPrompt
  };
}

// Convert image to base64 (for future Gemini Vision integration)
function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error reading image:', error.message);
    return null;
  }
}

// Save refined image URL to file
async function saveRefinedImage(imageUrl, outputPath) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error('Error saving image:', error.message);
    return false;
  }
}

// Main function
async function refineImage(inputPath) {
  console.log('🎯 IMAGE REFINER - PHOTOSHOOT STYLE GENERATOR');
  console.log('===========================================\n');
  
  // Validate input
  if (!inputPath) {
    console.log('❌ Usage: node image-refiner.js <image-path>');
    console.log('📝 Example: node image-refiner.js my-hoodie.jpg');
    return;
  }
  
  if (!fs.existsSync(inputPath)) {
    console.log(`❌ Error: File not found - ${inputPath}`);
    return;
  }
  
  console.log(`📁 Input Image: ${inputPath}`);
  
  // Detect product type
  const productType = detectProductType(inputPath);
  console.log(`🔍 Detected Product: ${productType}`);
  
  // Generate refined image
  console.log('🎨 Generating refined photoshoot-style image...');
  const result = await generateRefinedImage(inputPath, productType);
  
  console.log('\n📸 PHOTOSHOOT CONCEPT:');
  console.log(`👤 Model Type: ${result.concept.modelType}`);
  console.log(`📍 Setting: ${result.concept.setting}`);
  console.log(`🎭 Poses: ${result.concept.poses}`);
  console.log(`🎨 Style: ${result.concept.style}`);
  
  console.log('\n🔗 REFINED IMAGE URL:');
  console.log(result.imageUrl);
  
  // Generate output filename
  const inputName = path.parse(inputPath).name;
  const outputPath = path.join(path.dirname(inputPath), `${inputName}_refined.jpg`);
  
  console.log('\n⬇️ Downloading refined image...');
  const saved = await saveRefinedImage(result.imageUrl, outputPath);
  
  if (saved) {
    console.log(`✅ Refined image saved: ${outputPath}`);
  } else {
    console.log('❌ Failed to save image, but URL is available above');
  }
  
  console.log('\n🎉 REFINEMENT COMPLETE!');
  console.log('📋 What was done:');
  console.log('• Detected product type automatically');
  console.log('• Generated realistic model photoshoot scenario');
  console.log('• Created professional photography prompt');
  console.log('• Generated refined image with model');
  console.log('• Applied Instagram-worthy aesthetic');
  
  return {
    success: true,
    originalPath: inputPath,
    refinedPath: outputPath,
    imageUrl: result.imageUrl,
    productType: productType,
    concept: result.concept
  };
}

// Run if called directly
if (require.main === module) {
  const inputPath = process.argv[2];
  refineImage(inputPath).catch(console.error);
}

// Export for use as module
module.exports = {
  refineImage,
  detectProductType,
  getPhotoshootConcept,
  generateRefinedImage
};
