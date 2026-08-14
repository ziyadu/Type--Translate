import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Smile, 
  Sparkles, 
  Star, 
  Trophy, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Gamepad2, 
  BookOpen, 
  Award, 
  ArrowLeft, 
  Zap, 
  CheckCircle2, 
  Heart,
  Music,
  HelpCircle,
  Flame,
  Globe,
  Languages,
  Keyboard
} from 'lucide-react';
import { speakText, cancelSpeech, unlockSpeechSynthesis, sanitizeSpeechText } from '../utils/speech';

// Web Audio synthesizer for Kids Mode sounds (zero external assets dependency)
class KidsSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playKeyPress() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 + Math.random() * 80, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Ignore audio errors
    }
  }

  public playWordSuccess() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.25);
      });
    } catch {
      // Ignore
    }
  }

  public playMistake() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Ignore
    }
  }

  public playPop() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // Ignore
    }
  }
}

const kidsSound = new KidsSoundEngine();

// Word & Sentence Lists for Kids
export interface KidsWordItem {
  text: string;
  emoji: string;
  hint: string;
  category: 'animals' | 'birds' | 'fruits' | 'veggies' | 'greens' | 'proteins' | 'kitchen' | 'fun';
}

const EASY_KIDS_WORDS: KidsWordItem[] = [
  // 🐾 ANIMALS
  { text: 'cat', emoji: '🐱', hint: 'Meow! A furry pet cat', category: 'animals' },
  { text: 'dog', emoji: '🐶', hint: 'Woof! A friendly puppy', category: 'animals' },
  { text: 'rabbit', emoji: '🐰', hint: 'Hops around with floppy ears', category: 'animals' },
  { text: 'hamster', emoji: '🐹', hint: 'Cute cheek-stuffing pet', category: 'animals' },
  { text: 'turtle', emoji: '🐢', hint: 'Slow swimmer with a hard shell', category: 'animals' },
  { text: 'goldfish', emoji: '🐠', hint: 'Swims around in freshwater', category: 'animals' },
  { text: 'cow', emoji: '🐮', hint: 'Moo! Gives delicious fresh milk', category: 'animals' },
  { text: 'pig', emoji: '🐷', hint: 'Oink! Likes playing in mud', category: 'animals' },
  { text: 'sheep', emoji: '🐑', hint: 'Baa! Soft warm fluffy wool', category: 'animals' },
  { text: 'horse', emoji: '🐴', hint: 'Neigh! Gallops across fields', category: 'animals' },
  { text: 'goat', emoji: '🐐', hint: 'Baa! Loves climbing steep rocks', category: 'animals' },
  { text: 'lion', emoji: '🦁', hint: 'Roar! Mighty king of jungle', category: 'animals' },
  { text: 'tiger', emoji: '🐯', hint: 'Wild cat with orange stripes', category: 'animals' },
  { text: 'elephant', emoji: '🐘', hint: 'Huge animal with a long trunk', category: 'animals' },
  { text: 'monkey', emoji: '🐒', hint: 'Swings from tree branch to branch', category: 'animals' },
  { text: 'giraffe', emoji: '🦒', hint: 'Tall animal with a super long neck', category: 'animals' },
  { text: 'zebra', emoji: '🦓', hint: 'Has black and white stripes', category: 'animals' },
  { text: 'panda', emoji: '🐼', hint: 'Cute bear that eats green bamboo', category: 'animals' },
  { text: 'bear', emoji: '🐻', hint: 'Big fluffy animal loving sweet honey', category: 'animals' },
  { text: 'fox', emoji: '🦊', hint: 'Clever wild animal with bushy tail', category: 'animals' },
  { text: 'wolf', emoji: '🐺', hint: 'Howls at the bright night moon', category: 'animals' },
  { text: 'dolphin', emoji: '🐬', hint: 'Smart ocean friend jumping high', category: 'animals' },
  { text: 'whale', emoji: '🐳', hint: 'Giant of the deep blue ocean', category: 'animals' },
  { text: 'shark', emoji: '🦈', hint: 'Fast ocean swimmer with sharp teeth', category: 'animals' },
  { text: 'octopus', emoji: '🐙', hint: 'Eight wiggly arms under the sea', category: 'animals' },
  { text: 'crab', emoji: '🦀', hint: 'Walks sideways on sandy beach', category: 'animals' },
  { text: 'seal', emoji: '🦭', hint: 'Claps flippers on ice', category: 'animals' },
  { text: 'bee', emoji: '🐝', hint: 'Buzzz! Makes sweet honey', category: 'animals' },
  { text: 'butterfly', emoji: '🦋', hint: 'Beautiful fluttering colorful wings', category: 'animals' },
  { text: 'frog', emoji: '🐸', hint: 'Ribbit! Green hopper in pond', category: 'animals' },

  // 🐦 BIRDS (Feathered Friends & Mini-Quiz Category)
  { text: 'parrot', emoji: '🦜', hint: 'Colorful talking tropical bird', category: 'birds' },
  { text: 'owl', emoji: '🦉', hint: 'Hoot hoot! Wise night bird', category: 'birds' },
  { text: 'eagle', emoji: '🦅', hint: 'Soars high up in the sky', category: 'birds' },
  { text: 'penguin', emoji: '🐧', hint: 'Waddles on snow & swims fast', category: 'birds' },
  { text: 'flamingo', emoji: '🦩', hint: 'Pretty pink bird standing on one leg', category: 'birds' },
  { text: 'duck', emoji: '🦆', hint: 'Quack quack! Swims in ponds', category: 'birds' },
  { text: 'swan', emoji: '🦢', hint: 'Graceful white water bird', category: 'birds' },
  { text: 'peacock', emoji: '🦚', hint: 'Gorgeous bird with huge fan feathers', category: 'birds' },
  { text: 'toucan', emoji: '🦤', hint: 'Tropical bird with a giant colorful beak', category: 'birds' },
  { text: 'rooster', emoji: '🐓', hint: 'Cock-a-doodle-doo morning bird', category: 'birds' },
  { text: 'hummingbird', emoji: '🐦', hint: 'Tiny fast fluttering bird', category: 'birds' },
  { text: 'pigeon', emoji: '🕊️', hint: 'Gentle bird in parks & towns', category: 'birds' },

  // 🍎 FRUITS
  { text: 'apple', emoji: '🍎', hint: 'Sweet crispy red fruit', category: 'fruits' },
  { text: 'banana', emoji: '🍌', hint: 'Yellow fruit monkeys love', category: 'fruits' },
  { text: 'orange', emoji: '🍊', hint: 'Juicy citrus full of Vitamin C', category: 'fruits' },
  { text: 'strawberry', emoji: '🍓', hint: 'Sweet red berry with tiny seeds', category: 'fruits' },
  { text: 'grape', emoji: '🍇', hint: 'Juicy purple fruit in bunches', category: 'fruits' },
  { text: 'watermelon', emoji: '🍉', hint: 'Big juicy red summer melon', category: 'fruits' },
  { text: 'peach', emoji: '🍑', hint: 'Soft sweet fuzzy fruit', category: 'fruits' },
  { text: 'pineapple', emoji: '🍍', hint: 'Tropical fruit with spiky top', category: 'fruits' },
  { text: 'mango', emoji: '🥭', hint: 'Sweet yellow tropical delight', category: 'fruits' },
  { text: 'cherry', emoji: '🍒', hint: 'Small round red sweet fruit', category: 'fruits' },
  { text: 'kiwi', emoji: '🥝', hint: 'Fuzzy brown fruit green inside', category: 'fruits' },
  { text: 'lemon', emoji: '🍋', hint: 'Sour yellow citrus fruit', category: 'fruits' },
  { text: 'pear', emoji: '🍐', hint: 'Sweet juicy green bell fruit', category: 'fruits' },
  { text: 'coconut', emoji: '🥥', hint: 'Hard shell with sweet water', category: 'fruits' },
  { text: 'melon', emoji: '🍈', hint: 'Sweet refreshing melon slice', category: 'fruits' },

  // 🥕 VEGETABLES
  { text: 'carrot', emoji: '🥕', hint: 'Crunchy orange root veggie', category: 'veggies' },
  { text: 'broccoli', emoji: '🥦', hint: 'Looks like a little green tree', category: 'veggies' },
  { text: 'corn', emoji: '🌽', hint: 'Sweet yellow kernels on a cob', category: 'veggies' },
  { text: 'tomato', emoji: '🍅', hint: 'Juicy red veggie for salads', category: 'veggies' },
  { text: 'potato', emoji: '🥔', hint: 'Yummy veggie for mashed potatoes', category: 'veggies' },
  { text: 'cucumber', emoji: '🥒', hint: 'Cool crunchy green veggie', category: 'veggies' },
  { text: 'pepper', emoji: '🫑', hint: 'Colorful crunchy bell pepper', category: 'veggies' },
  { text: 'onion', emoji: '🧅', hint: 'Flavorful veggie used in cooking', category: 'veggies' },
  { text: 'garlic', emoji: '🧄', hint: 'Tasty seasoning bulb for pasta', category: 'veggies' },
  { text: 'mushroom', emoji: '🍄', hint: 'Veggie shaped like an umbrella', category: 'veggies' },
  { text: 'pea', emoji: '🫛', hint: 'Tiny sweet green pod veggies', category: 'veggies' },
  { text: 'avocado', emoji: '🥑', hint: 'Creamy green veggie with healthy fats', category: 'veggies' },
  { text: 'pumpkin', emoji: '🎃', hint: 'Big orange autumn vegetable', category: 'veggies' },

  // 🥬 LEAFY GREENS, HERBS & ASIAN / SOUTH ASIAN GREENS
  { text: 'spinach', emoji: '🥬', hint: 'Super healthy green leaf packed with iron', category: 'greens' },
  { text: 'romaine lettuce', emoji: '🥬', hint: 'Crisp green salad leaf', category: 'greens' },
  { text: 'iceberg lettuce', emoji: '🥬', hint: 'Cool crunchy salad lettuce', category: 'greens' },
  { text: 'butter lettuce', emoji: '🥬', hint: 'Soft tender butterhead lettuce', category: 'greens' },
  { text: 'kale', emoji: '🥬', hint: 'Superfood dark green curly leaf', category: 'greens' },
  { text: 'swiss chard', emoji: '🥬', hint: 'Colorful stemmed leafy green', category: 'greens' },
  { text: 'collard greens', emoji: '🥬', hint: 'Hearty southern green leaves', category: 'greens' },
  { text: 'mustard greens', emoji: '🥬', hint: 'Zesty peppery green leaves', category: 'greens' },
  { text: 'turnip greens', emoji: '🥬', hint: 'Nutritious green turnip top leaves', category: 'greens' },
  { text: 'beet greens', emoji: '🥬', hint: 'Healthy green beet top leaves', category: 'greens' },
  { text: 'arugula', emoji: '🥬', hint: 'Peppery salad rocket leaves', category: 'greens' },
  { text: 'watercress', emoji: '🥬', hint: 'Fresh aquatic green leaf', category: 'greens' },
  { text: 'bok choy', emoji: '🥬', hint: 'Crispy Asian green cabbage', category: 'greens' },
  { text: 'napa cabbage', emoji: '🥬', hint: 'Sweet Chinese leaf cabbage', category: 'greens' },
  { text: 'cabbage leaves', emoji: '🥬', hint: 'Layered crunchy cabbage leaves', category: 'greens' },
  { text: 'radish leaves', emoji: '🥬', hint: 'Fresh green radish tops', category: 'greens' },
  { text: 'carrot tops', emoji: '🥬', hint: 'Feathery green carrot leaves', category: 'greens' },
  { text: 'celery leaves', emoji: '🥬', hint: 'Fragrant green celery foliage', category: 'greens' },
  { text: 'fennel leaves', emoji: '🌿', hint: 'Feathery sweet aromatic fronds', category: 'greens' },

  // Asian Greens
  { text: 'amaranth leaves', emoji: '🍃', hint: 'Nutritious red-green leafy vegetable', category: 'greens' },
  { text: 'water spinach', emoji: '🥬', hint: 'Tender hollow-stem water green', category: 'greens' },
  { text: 'fenugreek leaves', emoji: '🌿', hint: 'Aromatic methi leaves for cooking', category: 'greens' },
  { text: 'curry leaves', emoji: '🌿', hint: 'Fragrant leaves for flavorful dishes', category: 'greens' },
  { text: 'moringa leaves', emoji: '🌿', hint: 'Superfood drumstick tree leaves', category: 'greens' },
  { text: 'drumstick leaves', emoji: '🌿', hint: 'Healthy green moringa foliage', category: 'greens' },
  { text: 'tatsoi', emoji: '🥬', hint: 'Spoon-shaped Asian dark green', category: 'greens' },
  { text: 'komatsuna', emoji: '🥬', hint: 'Japanese mustard spinach leaf', category: 'greens' },
  { text: 'gai lan leaves', emoji: '🥬', hint: 'Chinese broccoli leaf greens', category: 'greens' },
  { text: 'choy sum', emoji: '🥬', hint: 'Sweet flowering Asian brassica', category: 'greens' },
  { text: 'chinese spinach', emoji: '🥬', hint: 'Tender Asian spinach variety', category: 'greens' },
  { text: 'chrysanthemum greens', emoji: '🌿', hint: 'Aromatic edible leaf greens', category: 'greens' },
  { text: 'perilla leaves', emoji: '🍃', hint: 'Fragrant sesame leaf herb', category: 'greens' },
  { text: 'shiso leaves', emoji: '🍃', hint: 'Japanese aromatic herb leaf', category: 'greens' },

  // Herbs
  { text: 'coriander leaves', emoji: '🌿', hint: 'Fresh cilantro herb leaves', category: 'greens' },
  { text: 'parsley leaves', emoji: '🌿', hint: 'Bright green garnish herb', category: 'greens' },
  { text: 'mint leaves', emoji: '🌿', hint: 'Cool refreshing aromatic herb', category: 'greens' },
  { text: 'basil leaves', emoji: '🌿', hint: 'Sweet Italian pesto herb', category: 'greens' },
  { text: 'thai basil leaves', emoji: '🌿', hint: 'Spicy anise-scented basil', category: 'greens' },
  { text: 'holy basil leaves', emoji: '🌿', hint: 'Sacred tulsi herb leaves', category: 'greens' },
  { text: 'oregano leaves', emoji: '🌿', hint: 'Savory pizza herb leaves', category: 'greens' },
  { text: 'thyme leaves', emoji: '🌿', hint: 'Tiny aromatic garden herb', category: 'greens' },
  { text: 'rosemary leaves', emoji: '🌿', hint: 'Pine-scented savory herb', category: 'greens' },
  { text: 'sage leaves', emoji: '🌿', hint: 'Soft velvety aromatic herb', category: 'greens' },
  { text: 'tarragon leaves', emoji: '🌿', hint: 'Sweet liquorice-flavored herb', category: 'greens' },
  { text: 'dill leaves', emoji: '🌿', hint: 'Feathery herb for pickles', category: 'greens' },
  { text: 'bay leaves', emoji: '🍃', hint: 'Aromatic leaf for soups & stews', category: 'greens' },

  // Special Edible & South Asian Greens
  { text: 'grape leaves', emoji: '🍃', hint: 'Tender leaves for wrapping rice', category: 'greens' },
  { text: 'banana leaves', emoji: '🍃', hint: 'Large natural food wrapping leaf', category: 'greens' },
  { text: 'pandan leaves', emoji: '🍃', hint: 'Sweet fragrant Southeast Asian leaf', category: 'greens' },
  { text: 'kaffir lime leaves', emoji: '🍃', hint: 'Citrusy aromatic Thai leaf', category: 'greens' },
  { text: 'fig leaves', emoji: '🍃', hint: 'Sweet coconut-scented edible leaf', category: 'greens' },
  { text: 'nasturtium leaves', emoji: '🍃', hint: 'Peppery edible round leaf', category: 'greens' },
  { text: 'dandelion greens', emoji: '🌼', hint: 'Healthy bitter wild salad leaf', category: 'greens' },
  { text: 'sorrel leaves', emoji: '🍃', hint: 'Tangy lemony salad leaf', category: 'greens' },
  { text: 'endive leaves', emoji: '🥬', hint: 'Crispy curly salad greens', category: 'greens' },
  { text: 'chicory leaves', emoji: '🥬', hint: 'Nutritious slightly bitter leaf', category: 'greens' },

  // South Asian Greens
  { text: 'palak', emoji: '🥬', hint: 'Delicious Indian spinach greens', category: 'greens' },
  { text: 'methi', emoji: '🌿', hint: 'Flavorful fenugreek leaf curry green', category: 'greens' },
  { text: 'sarson leaves', emoji: '🥬', hint: 'Mustard green leaves for saag', category: 'greens' },
  { text: 'chaulai leaves', emoji: '🍃', hint: 'Nutritious amaranth greens', category: 'greens' },
  { text: 'malabar spinach', emoji: '🥬', hint: 'Thick succulent green leaf', category: 'greens' },
  { text: 'bathua leaves', emoji: '🍃', hint: 'Wild chenopodium winter green', category: 'greens' },
  { text: 'taro leaves', emoji: '🍃', hint: 'Large green elephant ear leaves', category: 'greens' },
  { text: 'pumpkin leaves', emoji: '🎃', hint: 'Tender green pumpkin vine leaf', category: 'greens' },
  { text: 'bottle gourd leaves', emoji: '🍃', hint: 'Healthy green vine leaves', category: 'greens' },

  // 🥩 PROTEINS (Fish, Meat, Chicken, Eggs, Tofu, Nuts)
  { text: 'fish', emoji: '🐟', hint: 'Healthy seafood full of protein', category: 'proteins' },
  { text: 'salmon', emoji: '🍣', hint: 'Pink ocean fish packed with protein', category: 'proteins' },
  { text: 'tuna', emoji: '🐟', hint: 'Tasty ocean fish for sandwiches', category: 'proteins' },
  { text: 'shrimp', emoji: '🦐', hint: 'Tasty pink seafood protein bite', category: 'proteins' },
  { text: 'chicken', emoji: '🍗', hint: 'Lean protein favorite for dinner', category: 'proteins' },
  { text: 'turkey', emoji: '🦃', hint: 'Delicious protein for feasts', category: 'proteins' },
  { text: 'beef', emoji: '🥩', hint: 'Protein-rich meat for burgers', category: 'proteins' },
  { text: 'steak', emoji: '🥩', hint: 'Hearty grilled meat protein', category: 'proteins' },
  { text: 'lamb', emoji: '🍖', hint: 'Tender savory protein cut', category: 'proteins' },
  { text: 'bacon', emoji: '🥓', hint: 'Crispy savory breakfast protein', category: 'proteins' },
  { text: 'sausage', emoji: '🌭', hint: 'Savory protein sausage link', category: 'proteins' },
  { text: 'egg', emoji: '🥚', hint: 'Superstar breakfast protein', category: 'proteins' },
  { text: 'tofu', emoji: '🧊', hint: 'Plant protein made from soybeans', category: 'proteins' },
  { text: 'beans', emoji: '🫘', hint: 'Healthy protein-packed legumes', category: 'proteins' },
  { text: 'peanut', emoji: '🥜', hint: 'Tasty nut rich in protein', category: 'proteins' },
  { text: 'almond', emoji: '🥜', hint: 'Crunchy nut packed with energy', category: 'proteins' },

  // 🍳 KITCHEN APPLIANCES, TOOLS, STORAGE & CLEANING
  // Appliances
  { text: 'stove', emoji: '🍳', hint: 'Hot appliance for cooking meals', category: 'kitchen' },
  { text: 'oven', emoji: '🍕', hint: 'Bakes cakes and roasts food', category: 'kitchen' },
  { text: 'microwave', emoji: '📻', hint: 'Warms up food quickly', category: 'kitchen' },
  { text: 'refrigerator', emoji: '🧊', hint: 'Keeps food cool and fresh', category: 'kitchen' },
  { text: 'freezer', emoji: '❄️', hint: 'Freezes ice cream and ice', category: 'kitchen' },
  { text: 'dishwasher', emoji: '🍽️', hint: 'Washes dirty plates and cups clean', category: 'kitchen' },
  { text: 'blender', emoji: '🥤', hint: 'Whiz! Makes fruit smoothies', category: 'kitchen' },
  { text: 'mixer', emoji: '🥣', hint: 'Beats cake batter and cream', category: 'kitchen' },
  { text: 'food processor', emoji: '🔪', hint: 'Chops and slices ingredients fast', category: 'kitchen' },
  { text: 'toaster', emoji: '🍞', hint: 'Pops up warm crispy toast', category: 'kitchen' },
  { text: 'kettle', emoji: '🫖', hint: 'Boils warm water for tea', category: 'kitchen' },
  { text: 'coffee machine', emoji: '☕', hint: 'Brews morning drinks for grown-ups', category: 'kitchen' },
  { text: 'rice cooker', emoji: '🍚', hint: 'Steams fluffy delicious rice', category: 'kitchen' },
  { text: 'pressure cooker', emoji: '🍲', hint: 'Cooks soups and stews super fast', category: 'kitchen' },
  { text: 'air fryer', emoji: '🍟', hint: 'Makes crispy snacks with warm air', category: 'kitchen' },
  { text: 'grill', emoji: '🥩', hint: 'Sizzles BBQ burgers and skewers', category: 'kitchen' },
  { text: 'sandwich maker', emoji: '🥪', hint: 'Presses warm toasted sandwiches', category: 'kitchen' },

  // Cooking tools
  { text: 'knife', emoji: '🔪', hint: 'Cuts and slices food neatly', category: 'kitchen' },
  { text: 'cutting board', emoji: '🪵', hint: 'Board where you chop veggies', category: 'kitchen' },
  { text: 'spoon', emoji: '🥄', hint: 'Scoops up warm soup and cereal', category: 'kitchen' },
  { text: 'fork', emoji: '🍴', hint: 'Pokes and holds food while eating', category: 'kitchen' },
  { text: 'plate', emoji: '🍽️', hint: 'Round dish holding your meal', category: 'kitchen' },
  { text: 'bowl', emoji: '🥣', hint: 'Deep dish for soup and cereal', category: 'kitchen' },
  { text: 'cup', emoji: '🥤', hint: 'Holds yummy milk and water', category: 'kitchen' },
  { text: 'glass', emoji: '🥛', hint: 'Clear tumbler for fresh juice', category: 'kitchen' },
  { text: 'mug', emoji: '☕', hint: 'Holds warm cocoa or tea', category: 'kitchen' },
  { text: 'pan', emoji: '🍳', hint: 'Shallow pan for cooking', category: 'kitchen' },
  { text: 'frying pan', emoji: '🍳', hint: 'Sizzles eggs and pancakes', category: 'kitchen' },
  { text: 'pot', emoji: '🍲', hint: 'Deep pot for boiling pasta', category: 'kitchen' },
  { text: 'saucepan', emoji: '🫕', hint: 'Small deep pot for warm sauce', category: 'kitchen' },
  { text: 'tray', emoji: '🍱', hint: 'Flat board for carrying dishes', category: 'kitchen' },
  { text: 'spatula', emoji: '🍳', hint: 'Flips pancakes and burgers smoothly', category: 'kitchen' },
  { text: 'whisk', emoji: '🥣', hint: 'Whips up fluffy eggs and cream', category: 'kitchen' },
  { text: 'ladle', emoji: '🍲', hint: 'Big deep spoon for scooping soup', category: 'kitchen' },
  { text: 'tongs', emoji: '🥢', hint: 'Grabs and turns hot food easily', category: 'kitchen' },
  { text: 'peeler', emoji: '🥔', hint: 'Peels skin off potatoes and apples', category: 'kitchen' },
  { text: 'grater', emoji: '🧀', hint: 'Shreds cheese into tiny bits', category: 'kitchen' },
  { text: 'strainer', emoji: '🍜', hint: 'Drains water off boiled pasta', category: 'kitchen' },
  { text: 'rolling pin', emoji: '🥖', hint: 'Rolls dough flat for pie or pizza', category: 'kitchen' },
  { text: 'measuring cup', emoji: '🥛', hint: 'Measures liquid ingredients', category: 'kitchen' },
  { text: 'measuring spoon', emoji: '🥄', hint: 'Measures small amounts of spices', category: 'kitchen' },
  { text: 'kitchen scissors', emoji: '✂️', hint: 'Snips food herbs and packages', category: 'kitchen' },

  // Storage items
  { text: 'container', emoji: '🫙', hint: 'Holds left-over food safely', category: 'kitchen' },
  { text: 'jar', emoji: '🫙', hint: 'Glass container for jam or cookies', category: 'kitchen' },
  { text: 'bottle', emoji: '🍾', hint: 'Holds cold water or oil', category: 'kitchen' },
  { text: 'lunch box', emoji: '🍱', hint: 'Carries your meal to school', category: 'kitchen' },
  { text: 'food box', emoji: '📦', hint: 'Box for storing pantry items', category: 'kitchen' },
  { text: 'plastic wrap', emoji: '🧻', hint: 'Clear wrap keeping food fresh', category: 'kitchen' },
  { text: 'aluminum foil', emoji: '🪙', hint: 'Shiny metal wrap for baking', category: 'kitchen' },
  { text: 'basket', emoji: '🧺', hint: 'Woven container holding fresh fruit', category: 'kitchen' },

  // Kitchen cleaning items
  { text: 'sponge', emoji: '🧽', hint: 'Soapy sponge for washing dishes', category: 'kitchen' },
  { text: 'dish soap', emoji: '🧼', hint: 'Makes bubbly foam to clean dishes', category: 'kitchen' },
  { text: 'towel', emoji: '🧻', hint: 'Dries clean dishes and hands', category: 'kitchen' },
  { text: 'apron', emoji: '🎽', hint: 'Worn to keep clothes clean while cooking', category: 'kitchen' },
  { text: 'gloves', emoji: '🧤', hint: 'Protects hands while cleaning', category: 'kitchen' },
  { text: 'brush', emoji: '🧹', hint: 'Scrubs pots and pans clean', category: 'kitchen' },
  { text: 'trash bin', emoji: '🗑️', hint: 'Holds food scraps and trash', category: 'kitchen' },

  // 🎈 FUN / GENERAL
  { text: 'sun', emoji: '☀️', hint: 'Bright yellow sun in the sky', category: 'fun' },
  { text: 'star', emoji: '⭐', hint: 'Glows softly in the night sky', category: 'fun' },
  { text: 'moon', emoji: '🌙', hint: 'Shines brightly at night', category: 'fun' },
  { text: 'rocket', emoji: '🚀', hint: 'Blast off to outer space!', category: 'fun' },
  { text: 'book', emoji: '📚', hint: 'Full of exciting adventure stories', category: 'fun' },
  { text: 'car', emoji: '🚗', hint: 'Vroom vroom on the road!', category: 'fun' },
];

const KIDS_SENTENCES = [
  { text: 'A friendly dog wags its tail.', emoji: '🐶' },
  { text: 'The furry cat drinks warm milk.', emoji: '🐱🥛' },
  { text: 'Elephants love drinking fresh water.', emoji: '🐘💧' },
  { text: 'Dolphins jump high in the blue ocean.', emoji: '🐬🌊' },
  { text: 'Lions roar loudly in the wild jungle.', emoji: '🦁' },
  { text: 'Apples and bananas are sweet fruits.', emoji: '🍎🍌' },
  { text: 'Crunchy carrots give you bright vision.', emoji: '🥕' },
  { text: 'Fresh broccoli and corn taste yummy.', emoji: '🥦🌽' },
  { text: 'Fish and chicken are rich in protein.', emoji: '🐟🍗' },
  { text: 'Eggs and tofu give you strong muscles.', emoji: '🥚🧊' },
  { text: 'Grilled salmon and steak are hearty protein.', emoji: '🍣🥩' },
  { text: 'The rocket flies all the way to the moon.', emoji: '🚀🌙' },
];

const BALLOON_WORDS = [
  'cat', 'dog', 'cow', 'pig', 'lion', 'bear', 'fish', 'duck', 'frog', 'bee',
  'apple', 'grape', 'lemon', 'peach', 'mango', 'pear', 'corn', 'pea', 'onion',
  'egg', 'tofu', 'beef', 'lamb', 'steak', 'tuna', 'star', 'sun', 'moon', 'hero'
];

interface KidsBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

interface KidsAlphabetItem {
  letter: string;
  word: string;
  emoji: string;
}

const ALPHABET_ITEMS: KidsAlphabetItem[] = [
  { letter: 'A', word: 'Apple', emoji: '🍎' },
  { letter: 'B', word: 'Ball', emoji: '⚽' },
  { letter: 'C', word: 'Cat', emoji: '🐱' },
  { letter: 'D', word: 'Dog', emoji: '🐶' },
  { letter: 'E', word: 'Elephant', emoji: '🐘' },
  { letter: 'F', word: 'Fish', emoji: '🐟' },
  { letter: 'G', word: 'Giraffe', emoji: '🦒' },
  { letter: 'H', word: 'Horse', emoji: '🐴' },
  { letter: 'I', word: 'Ice Cream', emoji: '🍦' },
  { letter: 'J', word: 'Juice', emoji: '🧃' },
  { letter: 'K', word: 'Kangaroo', emoji: '🦘' },
  { letter: 'L', word: 'Lion', emoji: '🦁' },
  { letter: 'M', word: 'Monkey', emoji: '🐒' },
  { letter: 'N', word: 'Nest', emoji: '🪹' },
  { letter: 'O', word: 'Owl', emoji: '🦉' },
  { letter: 'P', word: 'Panda', emoji: '🐼' },
  { letter: 'Q', word: 'Queen', emoji: '👑' },
  { letter: 'R', word: 'Rabbit', emoji: '🐰' },
  { letter: 'S', word: 'Sun', emoji: '☀️' },
  { letter: 'T', word: 'Tiger', emoji: '🐯' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️' },
  { letter: 'V', word: 'Violin', emoji: '🎻' },
  { letter: 'W', word: 'Whale', emoji: '🐳' },
  { letter: 'X', word: 'Xylophone', emoji: '🎼' },
  { letter: 'Y', word: 'Yak', emoji: '🐂' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓' },
];

// Helper for auto-scaling letter box size based on word length so words never overflow the box
const getDynamicLetterBoxStyle = (wordText: string) => {
  const cleanLen = wordText.length;
  if (cleanLen <= 3) {
    return {
      boxClass: 'w-12 h-14 sm:w-20 sm:h-24 text-3xl sm:text-5xl rounded-2xl border-4',
      gapClass: 'gap-2 sm:gap-3',
    };
  }
  if (cleanLen <= 5) {
    return {
      boxClass: 'w-10 h-12 sm:w-16 sm:h-20 text-2xl sm:text-4xl rounded-xl sm:rounded-2xl border-3 sm:border-4',
      gapClass: 'gap-1.5 sm:gap-2.5',
    };
  }
  if (cleanLen <= 7) {
    return {
      boxClass: 'w-8 h-10 sm:w-12 sm:h-16 text-xl sm:text-3xl rounded-lg sm:rounded-xl border-2 sm:border-3',
      gapClass: 'gap-1 sm:gap-2',
    };
  }
  if (cleanLen <= 9) {
    return {
      boxClass: 'w-7 h-9 sm:w-10 sm:h-13 text-base sm:text-2xl rounded-md sm:rounded-lg border-2',
      gapClass: 'gap-1 sm:gap-1.5',
    };
  }
  if (cleanLen <= 12) {
    return {
      boxClass: 'w-6 h-8 sm:w-8 sm:h-11 text-xs sm:text-xl rounded-md border-2',
      gapClass: 'gap-0.5 sm:gap-1',
    };
  }
  return {
    boxClass: 'w-5 h-7 sm:w-7 sm:h-9 text-[10px] sm:text-lg rounded-sm sm:rounded-md border',
    gapClass: 'gap-0.5',
  };
};

interface KidsModeViewProps {
  onExitKidsMode: () => void;
}

export const KidsModeView: React.FC<KidsModeViewProps> = ({ onExitKidsMode }) => {
  // Theme state
  const [theme, setTheme] = useState<'candy' | 'cosmic' | 'jungle' | 'ocean'>('candy');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);

  // Game mode: 'alphabet' | 'words' | 'sentences' | 'balloons'
  const [gameMode, setGameMode] = useState<'alphabet' | 'words' | 'sentences' | 'balloons'>('alphabet');
  const [alphabetIndex, setAlphabetIndex] = useState(0);

  // Kids State
  const [wordCategory, setWordCategory] = useState<'all' | 'animals' | 'birds' | 'fruits' | 'veggies' | 'greens' | 'proteins' | 'kitchen'>('all');
  const [wordIndex, setWordIndex] = useState(0);
  const [typedInput, setTypedInput] = useState('');
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wordsCompletedCount, setWordsCompletedCount] = useState(0);

  // Bird Mini-Quiz State
  interface BirdQuizState {
    targetBird: KidsWordItem;
    options: KidsWordItem[];
  }
  const [activeBirdQuiz, setActiveBirdQuiz] = useState<BirdQuizState | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Active word list according to selected category filter
  const activeWords = React.useMemo(() => {
    if (wordCategory === 'all') return EASY_KIDS_WORDS;
    return EASY_KIDS_WORDS.filter((w) => w.category === wordCategory);
  }, [wordCategory]);

  const currentWord = activeWords[wordIndex % activeWords.length] || activeWords[0];
  const currentSentence = KIDS_SENTENCES[wordIndex % KIDS_SENTENCES.length] || KIDS_SENTENCES[0];
  const currentAlphabetItem = ALPHABET_ITEMS[alphabetIndex % ALPHABET_ITEMS.length] || ALPHABET_ITEMS[0];

  // Celebration animation state
  interface FloatingStar {
    id: number;
    x: number;
    size: number;
    emoji: string;
    rotation: number;
    xDrift: number;
    duration: number;
  }
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);
  const [jumpingStars, setJumpingStars] = useState<FloatingStar[]>([]);
  const [showPulseRing, setShowPulseRing] = useState(false);

  // Mascot Message
  const [mascotText, setMascotText] = useState('Hi! Type the letters you see on screen! 🚀');
  const [mascotAction, setMascotAction] = useState<'happy' | 'cheer' | 'think'>('happy');

  // Badges state
  const [badgesModalOpen, setBadgesModalOpen] = useState(false);
  const [badges, setBadges] = useState<KidsBadge[]>([
    { id: 'first_word', name: 'First Steps 🐣', icon: '🐣', description: 'Type your very first word!', unlocked: false },
    { id: 'star_10', name: 'Star Collector ⭐', icon: '⭐', description: 'Earn 10 shiny stars!', unlocked: false },
    { id: 'streak_5', name: 'Combo Master 🔥', icon: '🔥', description: 'Get a 5-word streak!', unlocked: false },
    { id: 'words_20', name: 'Super Typist 🚀', icon: '🚀', description: 'Complete 20 typing exercises!', unlocked: false },
    { id: 'balloon_master', name: 'Pop Hero 🎈', icon: '🎈', description: 'Pop 5 balloons in Balloon Pop!', unlocked: false },
  ]);

  // Balloon game specific state
  interface ActiveBalloon {
    id: number;
    word: string;
    xPercent: number;
    yPercent: number;
    speed: number;
    color: string;
  }
  const [balloons, setBalloons] = useState<ActiveBalloon[]>([]);
  const [balloonInput, setBalloonInput] = useState('');
  const [balloonScore, setBalloonScore] = useState(0);

  // Refs for focusing hidden input
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    kidsSound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Unlock badge helper
  const unlockBadge = (id: string) => {
    setBadges((prev) =>
      prev.map((b) => {
        if (b.id === id && !b.unlocked) {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
          setMascotText(`🎉 NEW BADGE UNLOCKED: ${b.name}! Great job!`);
          setMascotAction('cheer');
          return { ...b, unlocked: true };
        }
        return b;
      })
    );
  };

  // Ensure focus on hidden input so typing works seamlessly
  const focusInput = () => {
    if (hiddenInputRef.current && document.activeElement !== hiddenInputRef.current) {
      try {
        hiddenInputRef.current.focus({ preventScroll: true });
      } catch {
        hiddenInputRef.current.focus();
      }
    }
  };

  useEffect(() => {
    focusInput();
  }, [gameMode, wordIndex]);

  // Speech synthesis for Kids Read Aloud
  const speakWord = (text: string) => {
    if (!soundEnabled) return;
    unlockSpeechSynthesis();
    const clean = sanitizeSpeechText(text);
    speakText(clean || text, {
      rate: 0.85, // Clear & friendly for kids
      pitch: 1.15,
      lang: 'en-US',
      cancelPrevious: true,
    });
  };

  // Celebration animation launcher
  const triggerCelebrationAnimations = () => {
    // Wave 1: Dual side rainbow confetti cannons
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 65,
      origin: { x: 0.05, y: 0.75 },
      colors: ['#ff4d4d', '#ffaf40', '#fffa65', '#32ff7e', '#18dcff', '#7d5fff', '#ff3838']
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 65,
      origin: { x: 0.95, y: 0.75 },
      colors: ['#ff4d4d', '#ffaf40', '#fffa65', '#32ff7e', '#18dcff', '#7d5fff', '#ff3838']
    });

    // Wave 2: Center Star & Circle Burst
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { x: 0.5, y: 0.55 },
        shapes: ['star', 'circle'],
        scalar: 1.3,
        colors: ['#ffd700', '#ff69b4', '#00bfff', '#7bed9f', '#ff4757']
      });
    }, 140);

    // Wave 3: Top Fireworks Explosion
    setTimeout(() => {
      confetti({
        particleCount: 30,
        angle: 90,
        spread: 120,
        startVelocity: 25,
        origin: { x: 0.5, y: 0.25 },
        colors: ['#ffffff', '#ffd700', '#ff9ff3', '#54a0ff']
      });
    }, 280);

    // Spawn 12 jumping stars & celebratory emojis bursting across screen with rotation & sway drift
    const starEmojis = ['⭐', '🌟', '✨', '🎉', '🎈', '🏆', '💎', '🚀', '👑', '🌈', '🎨', '🦄'];
    const newStars: FloatingStar[] = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i + Math.random(),
      x: 5 + Math.random() * 90,
      size: 28 + Math.random() * 28,
      emoji: starEmojis[Math.floor(Math.random() * starEmojis.length)],
      rotation: (Math.random() - 0.5) * 540,
      xDrift: (Math.random() - 0.5) * 120,
      duration: 1.2 + Math.random() * 0.4,
    }));
    setJumpingStars(newStars);
    setTimeout(() => setJumpingStars([]), 1600);

    // Trigger pulse ring animation
    setShowPulseRing(true);
    setTimeout(() => setShowPulseRing(false), 900);

    // Show celebratory banner
    const banners = [
      'SUPER STAR! 🌟',
      'PERFECT! ⭐',
      'AWESOME TYPING! 🚀',
      'GREAT JOB! 🎉',
      'WOOHOO! 🎈',
      'LIGHTNING FAST! ⚡',
      'MAGIC FINGERS! ✨',
      'GENIUS TYPIST! 🏆',
    ];
    const chosenBanner = banners[Math.floor(Math.random() * banners.length)];
    setCelebrationBanner(chosenBanner);
    setTimeout(() => setCelebrationBanner(null), 1200);
  };

  // Handle option click in Bird Mini-Quiz
  const handleQuizOptionClick = (option: KidsWordItem) => {
    if (!activeBirdQuiz) return;

    if (option.text === activeBirdQuiz.targetBird.text) {
      kidsSound.playWordSuccess();
      triggerCelebrationAnimations();
      speakWord(`Correct! That is the ${option.text}! Great job!`);
      setQuizFeedback('correct');
      setStars((prev) => prev + 2); // Bonus stars for quiz!
      setMascotText(`🌟 BRAVO! You identified the ${option.text}! +2 Bonus Stars!`);
      setMascotAction('cheer');

      setTimeout(() => {
        setActiveBirdQuiz(null);
        setQuizFeedback(null);
        setTypedInput('');
        setWordIndex((prev) => (prev + 1) % activeWords.length);
      }, 1300);
    } else {
      kidsSound.playMistake();
      speakWord(`Oops, that is the ${option.text}. Try again!`);
      setQuizFeedback('incorrect');
      setMascotText(`Almost! That's a ${option.text}. Tap another bird! 🐥`);
      setMascotAction('think');

      setTimeout(() => {
        setQuizFeedback(null);
      }, 1500);
    }
  };

  // Handle typing input in Alphabet Learning mode
  const handleAlphabetInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setTypedInput('');
      return;
    }
    const lastChar = value.slice(-1).toUpperCase();
    kidsSound.playKeyPress();

    const currentItem = ALPHABET_ITEMS[alphabetIndex % ALPHABET_ITEMS.length];

    if (lastChar === currentItem.letter) {
      kidsSound.playWordSuccess();
      triggerCelebrationAnimations();
      speakWord(`${currentItem.letter}! ${currentItem.word}!`);

      const newStars = stars + 1;
      const newStreak = streak + 1;
      const newCompleted = wordsCompletedCount + 1;

      setStars(newStars);
      setStreak(newStreak);
      setWordsCompletedCount(newCompleted);

      if (newCompleted >= 1) unlockBadge('first_word');
      if (newStars >= 10) unlockBadge('star_10');
      if (newStreak >= 5) unlockBadge('streak_5');

      setMascotText(`🌟 BRAVO! You typed '${currentItem.letter}'! Great pronunciation!`);
      setMascotAction('cheer');

      setTypedInput('');
      setTimeout(() => {
        setAlphabetIndex((prev) => (prev + 1) % ALPHABET_ITEMS.length);
      }, 450);
    } else if (/[A-Z]/.test(lastChar)) {
      kidsSound.playMistake();
      speakWord(`That is ${lastChar}. Let's type ${currentItem.letter}!`);
      setMascotText(`You typed '${lastChar}'! Try typing '${currentItem.letter}'! 💪`);
      setMascotAction('think');
      setTypedInput('');
    }
  };

  // Handle typing input in Word & Sentence modes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const targetText = gameMode === 'words' ? currentWord.text : currentSentence.text;

    kidsSound.playKeyPress();
    setTypedInput(value);

    // Check if mistake was just made
    if (value.length > 0 && !targetText.toLowerCase().startsWith(value.toLowerCase())) {
      kidsSound.playMistake();
      setStreak(0);
      setMascotText("Oopsie! Press Backspace and try that letter again! 💪");
      setMascotAction('think');
      return;
    }

    // Check if word/sentence completed!
    if (value.toLowerCase() === targetText.toLowerCase()) {
      kidsSound.playWordSuccess();
      triggerCelebrationAnimations();
      speakWord(targetText); // Read out loud!

      const newStars = stars + 1;
      const newStreak = streak + 1;
      const newCompleted = wordsCompletedCount + 1;

      setStars(newStars);
      setStreak(newStreak);
      setWordsCompletedCount(newCompleted);

      // Check badges
      if (newCompleted >= 1) unlockBadge('first_word');
      if (newStars >= 10) unlockBadge('star_10');
      if (newStreak >= 5) unlockBadge('streak_5');
      if (newCompleted >= 20) unlockBadge('words_20');

      // Mascot reaction
      const cheers = [
        "SUPER STAR! 🌟 Fantastic typing!",
        "YOU ARE AWESOME! 🔥 Keep it up!",
        "WOOHOO! 🎈 Perfect spelling!",
        "FINGERS LIKE LIGHTNING! ⚡ Great job!",
      ];
      setMascotText(cheers[Math.floor(Math.random() * cheers.length)]);
      setMascotAction('cheer');

      // Trigger Bird Mini-Quiz if completed word is a Bird!
      if (gameMode === 'words' && currentWord.category === 'birds') {
        const allBirds = EASY_KIDS_WORDS.filter((w) => w.category === 'birds');
        const correctBird = currentWord;
        const otherBirds = allBirds.filter((b) => b.text !== correctBird.text);
        const shuffledOthers = [...otherBirds].sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [...shuffledOthers, correctBird].sort(() => 0.5 - Math.random());

        setTimeout(() => {
          setActiveBirdQuiz({
            targetBird: correctBird,
            options,
          });
          setQuizFeedback(null);
          setMascotText(`🐦 MINI-QUIZ TIME! Which illustration is the ${correctBird.text.toUpperCase()}? 🌟`);
          setMascotAction('happy');
        }, 600);
        return; // Pause automatic advancement until quiz completes
      }

      // Move to next word/sentence after brief pause
      setTimeout(() => {
        setTypedInput('');
        if (gameMode === 'words') {
          setWordIndex((prev) => (prev + 1) % activeWords.length);
        } else {
          setWordIndex((prev) => (prev + 1) % KIDS_SENTENCES.length);
        }
      }, 350);
    }
  };

  // Balloon game loop
  useEffect(() => {
    if (gameMode !== 'balloons') return;

    // Spawn balloon interval
    const colors = ['bg-pink-400', 'bg-purple-400', 'bg-amber-400', 'bg-emerald-400', 'bg-sky-400', 'bg-rose-400'];
    const spawnInterval = setInterval(() => {
      setBalloons((prev) => {
        if (prev.length >= 5) return prev;
        const randomWord = BALLOON_WORDS[Math.floor(Math.random() * BALLOON_WORDS.length)];
        const newBalloon: ActiveBalloon = {
          id: Date.now() + Math.random(),
          word: randomWord,
          xPercent: Math.floor(Math.random() * 75) + 10,
          yPercent: 100, // Starts at bottom
          speed: 0.8 + Math.random() * 0.8,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
        return [...prev, newBalloon];
      });
    }, 2000);

    // Float loop
    const floatInterval = setInterval(() => {
      setBalloons((prev) =>
        prev
          .map((b) => ({ ...b, yPercent: b.yPercent - b.speed }))
          .filter((b) => b.yPercent > -15) // Remove balloon when floats off top
      );
    }, 50);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(floatInterval);
    };
  }, [gameMode]);

  // Handle balloon typing pop
  const handleBalloonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().trim();
    setBalloonInput(value);
    kidsSound.playKeyPress();

    // Check if any balloon matches input
    const matched = balloons.find((b) => b.word.toLowerCase() === value);
    if (matched) {
      kidsSound.playPop();
      speakWord(matched.word);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 } });
      setBalloons((prev) => prev.filter((b) => b.id !== matched.id));
      setBalloonInput('');
      setBalloonScore((s) => s + 10);
      setStars((s) => s + 2);
      setMascotText(`POP! 🎈 You popped "${matched.word}"! +10 Points!`);
      setMascotAction('cheer');

      if (balloonScore + 10 >= 50) {
        unlockBadge('balloon_master');
      }
    }
  };

  // Keyboard Key Display helper
  const renderVirtualKeyboard = () => {
    const rows = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];

    let currentTargetChar = '';
    if (gameMode === 'alphabet') {
      currentTargetChar = currentAlphabetItem.letter.toLowerCase();
    } else if (gameMode === 'words') {
      const text = currentWord.text;
      currentTargetChar = text[typedInput.length]?.toLowerCase() || '';
    } else if (gameMode === 'sentences') {
      const text = currentSentence.text;
      currentTargetChar = text[typedInput.length]?.toLowerCase() || '';
    }

    return (
      <div className="w-full max-w-2xl mx-auto mt-4 p-3 rounded-2xl bg-white/40 backdrop-blur-md border-2 border-amber-300 shadow-lg select-none">
        <div className="flex flex-col gap-1.5 items-center">
          {rows.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-1.5 justify-center w-full">
              {row.map((char) => {
                const isNextTarget = currentTargetChar === char;
                return (
                  <button
                    key={char}
                    onClick={() => {
                      if (gameMode === 'balloons') {
                        const newInput = balloonInput + char;
                        setBalloonInput(newInput);
                        handleBalloonInputChange({ target: { value: newInput } } as React.ChangeEvent<HTMLInputElement>);
                      } else if (gameMode === 'alphabet') {
                        handleAlphabetInput({ target: { value: char } } as React.ChangeEvent<HTMLInputElement>);
                      } else {
                        const newInput = typedInput + char;
                        handleInputChange({ target: { value: newInput } } as React.ChangeEvent<HTMLInputElement>);
                      }
                    }}
                    className={`h-11 sm:h-12 flex-1 max-w-[50px] rounded-xl font-bold font-mono text-lg uppercase transition-all duration-150 flex items-center justify-center cursor-pointer shadow-md ${
                      isNextTarget
                        ? 'bg-amber-400 text-slate-900 border-2 border-white scale-110 shadow-lg animate-bounce ring-4 ring-amber-300'
                        : 'bg-white/80 hover:bg-white text-slate-800 border border-slate-200 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {char}
                  </button>
                );
              })}
            </div>
          ))}
          {/* Spacebar */}
          <div className="w-full flex justify-center mt-1">
            <button
              onClick={() => {
                if (gameMode !== 'balloons' && gameMode !== 'alphabet') {
                  const newInput = typedInput + ' ';
                  handleInputChange({ target: { value: newInput } } as React.ChangeEvent<HTMLInputElement>);
                }
              }}
              className={`h-10 w-2/3 rounded-xl font-bold font-mono text-sm uppercase transition-all duration-150 flex items-center justify-center cursor-pointer shadow-md ${
                currentTargetChar === ' '
                  ? 'bg-amber-400 text-slate-900 border-2 border-white scale-105 shadow-lg animate-pulse ring-4 ring-amber-300'
                  : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200'
              }`}
            >
              SPACEBAR 🚀
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Theme styling presets
  const themeStyles = {
    candy: 'bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 text-slate-800',
    cosmic: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white',
    jungle: 'bg-gradient-to-br from-emerald-200 via-teal-200 to-amber-100 text-slate-900',
    ocean: 'bg-gradient-to-br from-sky-200 via-cyan-200 to-blue-300 text-slate-900',
  };

  return (
    <div 
      className={`min-h-screen flex flex-col justify-between transition-colors duration-500 font-sans relative overflow-hidden select-none ${themeStyles[theme]}`}
      onClick={focusInput}
    >
      {/* Hidden input to capture physical keyboard input reliably */}
      <input
        ref={hiddenInputRef}
        type="text"
        value={gameMode === 'balloons' ? balloonInput : typedInput}
        onChange={
          gameMode === 'balloons'
            ? handleBalloonInputChange
            : gameMode === 'alphabet'
            ? handleAlphabetInput
            : handleInputChange
        }
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none -z-10 border-0 p-0 m-0 overflow-hidden"
        tabIndex={-1}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        autoFocus
      />

      {/* Golden / Rainbow Pulse Ring Wave Overlay */}
      <AnimatePresence>
        {showPulseRing && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0.9 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="fixed inset-0 m-auto w-80 h-80 sm:w-96 sm:h-96 rounded-full border-8 border-amber-400/80 bg-amber-300/20 backdrop-blur-xs pointer-events-none z-30 flex items-center justify-center shadow-[0_0_80px_rgba(251,191,36,0.6)]"
          />
        )}
      </AnimatePresence>

      {/* Celebratory Floating Jumping Stars Overlay */}
      <AnimatePresence>
        {jumpingStars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0, y: '85vh', x: 0, scale: 0.4, rotate: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: ['80vh', '25vh', '-10vh'], 
              x: [0, star.xDrift * 0.5, star.xDrift],
              scale: [0.4, 1.5, 1.2, 0.6],
              rotate: [0, star.rotation * 0.5, star.rotation]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: star.duration, ease: 'easeOut' }}
            className="fixed z-40 pointer-events-none select-none drop-shadow-xl"
            style={{ left: `${star.x}%`, fontSize: `${star.size}px` }}
          >
            {star.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Celebratory Big Banner Overlay */}
      <AnimatePresence>
        {celebrationBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.4, y: -40 }}
            animate={{ opacity: 1, scale: 1.1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="px-6 py-3 rounded-3xl bg-amber-400 border-4 border-white text-slate-900 font-black text-2xl sm:text-4xl shadow-2xl tracking-wide flex items-center gap-3 animate-bounce">
              <Sparkles className="w-8 h-8 text-slate-900 animate-spin-slow" />
              <span>{celebrationBanner}</span>
              <Sparkles className="w-8 h-8 text-slate-900 animate-spin-slow" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar for Kids Mode */}
      <header className="p-4 sm:px-8 border-b border-white/30 bg-white/40 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between shadow-xs">
        {/* Brand & Exit switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExitKidsMode}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-amber-100 text-slate-900 font-extrabold text-xs sm:text-sm border-2 border-amber-300 shadow-md hover:scale-105 transition-all cursor-pointer"
            title="Return to standard main app"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            <span>Exit Kids Mode</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl animate-bounce">🎈</span>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-wide drop-shadow-xs">
              KIDS PLAYGROUND<span className="text-amber-500">!</span>
            </h1>
          </div>
        </div>

        {/* Top Right Utilities & Rewards */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme selector */}
          <div className="hidden md:flex items-center gap-1 bg-white/60 p-1 rounded-full border border-white/40">
            {(['candy', 'cosmic', 'jungle', 'ocean'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                  theme === t ? 'bg-amber-400 text-slate-900 shadow-sm scale-105' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-2xl bg-white/80 hover:bg-white text-slate-800 shadow-md cursor-pointer border border-white/50"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-600" /> : <VolumeX className="w-5 h-5 text-rose-500" />}
          </button>

          {/* On-screen Virtual Keyboard toggle */}
          <button
            onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
            className={`p-2 rounded-2xl shadow-md cursor-pointer border border-white/50 transition-all ${
              showVirtualKeyboard ? 'bg-amber-400 text-slate-900 ring-2 ring-white' : 'bg-white/80 hover:bg-white text-slate-800'
            }`}
            title={showVirtualKeyboard ? 'Hide On-Screen Keyboard' : 'Show On-Screen Keyboard'}
          >
            <Keyboard className="w-5 h-5" />
          </button>

          {/* Badges Button */}
          <button
            onClick={() => setBadgesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-105 border-2 border-white"
          >
            <Trophy className="w-4 h-4 text-slate-900" />
            <span>Badges</span>
            <span className="bg-slate-900 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {badges.filter((b) => b.unlocked).length}/{badges.length}
            </span>
          </button>

          {/* Star Counter */}
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white text-slate-900 font-black text-sm shadow-md border-2 border-amber-300">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400 animate-spin-slow" />
            <span>{stars}</span>
          </div>
        </div>
      </header>

      {/* Main Kids Content Area */}
      <main className="max-w-4xl w-full mx-auto px-4 py-6 flex-1 flex flex-col items-center justify-between gap-6 z-10">
        
        {/* Game View 0: ALPHABET LEARNING MODE */}
        {gameMode === 'alphabet' && (
          <div className="w-full flex flex-col items-center gap-5 animate-in fade-in duration-300">
            {/* Display Large Letter Card */}
            <div className="w-full bg-white/90 backdrop-blur-xl border-4 border-amber-300 p-8 sm:p-12 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-6 relative overflow-hidden">
              
              {/* Top Banner & Sound Indicator */}
              <div className="flex items-center justify-between w-full">
                <span className="text-xs sm:text-sm font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  🔤 Letter {alphabetIndex + 1} of {ALPHABET_ITEMS.length}
                </span>
                <button
                  onClick={() => speakWord(`${currentAlphabetItem.letter}. ${currentAlphabetItem.letter} is for ${currentAlphabetItem.word}`)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer border border-white"
                  title="Listen out loud"
                >
                  <Volume2 className="w-4 h-4 text-slate-900" />
                  <span>Listen 🔊</span>
                </button>
              </div>

              {/* Main Interactive Tap-to-Pronounce Letter Display */}
              <motion.button
                key={currentAlphabetItem.letter}
                initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                whileHover={{ scale: 1.08, rotate: 2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  kidsSound.playWordSuccess();
                  speakWord(`${currentAlphabetItem.letter}! ${currentAlphabetItem.letter} is for ${currentAlphabetItem.word}!`);
                }}
                className="group relative flex flex-col items-center justify-center cursor-pointer select-none py-4 px-8 rounded-3xl transition-all"
              >
                {/* Background glow halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-200 via-pink-200 to-indigo-200 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
                
                {/* One Large Letter */}
                <span className="relative text-8xl sm:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-500 via-rose-500 to-purple-600 drop-shadow-md group-hover:drop-shadow-2xl transition-all">
                  {currentAlphabetItem.letter}
                </span>

                {/* Phonics Example Word & Emoji */}
                <div className="relative flex items-center gap-2 mt-3 px-5 py-2.5 bg-amber-50/90 rounded-2xl border border-amber-200 shadow-xs">
                  <span className="text-3xl sm:text-4xl">{currentAlphabetItem.emoji}</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-800">
                    {currentAlphabetItem.word}
                  </span>
                </div>

                <span className="relative mt-3 text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  Tap letter to hear pronunciation!
                </span>
              </motion.button>

              {/* Navigation Controls: Prev & Next Letter */}
              <div className="flex items-center justify-between w-full max-w-sm gap-3">
                <button
                  onClick={() => {
                    const prevIdx = (alphabetIndex - 1 + ALPHABET_ITEMS.length) % ALPHABET_ITEMS.length;
                    setAlphabetIndex(prevIdx);
                    setTypedInput('');
                    speakWord(ALPHABET_ITEMS[prevIdx].letter);
                  }}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm rounded-2xl shadow-xs border border-slate-300 flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <span>◀ Prev</span>
                </button>

                <button
                  onClick={() => {
                    kidsSound.playWordSuccess();
                    speakWord(currentAlphabetItem.letter);
                  }}
                  className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-sm rounded-2xl shadow-md border-2 border-amber-300 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Say "{currentAlphabetItem.letter}"</span>
                </button>

                <button
                  onClick={() => {
                    const nextIdx = (alphabetIndex + 1) % ALPHABET_ITEMS.length;
                    setAlphabetIndex(nextIdx);
                    setTypedInput('');
                    speakWord(ALPHABET_ITEMS[nextIdx].letter);
                  }}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm rounded-2xl shadow-xs border border-slate-300 flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Next ▶</span>
                </button>
              </div>
            </div>

            {/* A–Z Letter Ribbon Selector for Direct Jumping */}
            <div className="w-full bg-white/60 backdrop-blur-md p-3.5 rounded-2xl border-2 border-amber-200 shadow-sm">
              <div className="text-center text-xs font-black text-slate-600 mb-2.5">
                Pick any letter (A–Z) to learn & pronounce:
              </div>
              <div className="grid grid-cols-7 sm:grid-cols-13 gap-1.5">
                {ALPHABET_ITEMS.map((item, idx) => (
                  <button
                    key={item.letter}
                    onClick={() => {
                      setAlphabetIndex(idx);
                      setTypedInput('');
                      kidsSound.playKeyPress();
                      speakWord(`${item.letter}!`);
                    }}
                    className={`py-2 text-sm sm:text-base font-black rounded-xl transition-all cursor-pointer ${
                      alphabetIndex === idx
                        ? 'bg-amber-400 text-slate-900 shadow-md scale-110 ring-2 ring-amber-500 font-extrabold'
                        : 'bg-white/80 hover:bg-amber-100 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {item.letter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Game View 1: EASY WORDS MODE */}
        {gameMode === 'words' && (
          <div className="w-full flex flex-col items-center gap-4 animate-in fade-in duration-300">
            {/* Display Word Card */}
            <div className="w-full bg-white/90 backdrop-blur-xl border-4 border-amber-300 p-4 sm:p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-4 relative overflow-hidden">
              
              <div className="text-5xl sm:text-7xl animate-pulse select-none">
                {currentWord.emoji}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 max-w-full">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 text-center max-w-full break-words">
                  {currentWord.hint}
                </span>
                <button
                  onClick={() => speakWord(currentWord.text)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 border border-white shrink-0"
                  title="Listen out loud"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen 🔊</span>
                </button>
              </div>

              {/* Character Letters Display - Auto-Optimized Sizing */}
              {(() => {
                const { boxClass, gapClass } = getDynamicLetterBoxStyle(currentWord.text);
                return (
                  <div className={`flex flex-wrap justify-center items-center ${gapClass} font-black font-mono my-2 max-w-full px-1`}>
                    {currentWord.text.split('').map((char, index) => {
                      const typedChar = typedInput[index];
                      let colorClass = 'text-slate-300 border-slate-300 bg-white/50';
                      if (typedChar !== undefined) {
                        if (typedChar.toLowerCase() === char.toLowerCase()) {
                          colorClass = 'text-emerald-500 border-emerald-400 bg-emerald-50 scale-105 shadow-md';
                        } else {
                          colorClass = 'text-rose-500 border-rose-400 bg-rose-50 animate-shake';
                        }
                      } else if (index === typedInput.length) {
                        colorClass = 'text-slate-900 border-amber-400 bg-amber-100 animate-pulse ring-2 sm:ring-4 ring-amber-300 scale-105';
                      }

                      if (char === ' ') {
                        return (
                          <span
                            key={index}
                            className="w-3 sm:w-5 h-full flex items-center justify-center text-slate-300 font-sans"
                          >
                            ␣
                          </span>
                        );
                      }

                      return (
                        <span
                          key={index}
                          className={`flex items-center justify-center transition-all duration-200 uppercase shrink-0 ${boxClass} ${colorClass}`}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Progress Indicator */}
              <div className="w-full max-w-xs bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200 mt-2">
                <div 
                  className="bg-amber-400 h-full transition-all duration-300" 
                  style={{ width: `${((wordIndex + 1) / EASY_KIDS_WORDS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Category Filter Pills (Moved to bottom) */}
            <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 shadow-xs">
              {[
                { id: 'all', label: '🌟 All Words' },
                { id: 'animals', label: '🐾 Animals' },
                { id: 'birds', label: '🐦 Birds & Quiz' },
                { id: 'fruits', label: '🍎 Fruits' },
                { id: 'veggies', label: '🥕 Veggies' },
                { id: 'greens', label: '🥬 Leafy Greens & Herbs' },
                { id: 'proteins', label: '🥩 Proteins (Fish & Meat)' },
                { id: 'kitchen', label: '🍳 Kitchen & Tools' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setWordCategory(cat.id as any);
                    setWordIndex(0);
                    setTypedInput('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    wordCategory === cat.id
                      ? 'bg-amber-400 text-slate-900 shadow-md scale-105 ring-2 ring-white'
                      : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Game View 2: SENTENCES MODE */}
        {gameMode === 'sentences' && (
          <div className="w-full flex flex-col items-center gap-6 animate-in fade-in duration-300">
            <div className="w-full bg-white/90 backdrop-blur-xl border-4 border-amber-300 p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-4">
              
              <div className="flex items-center gap-3">
                <div className="text-5xl sm:text-6xl select-none">
                  {currentSentence.emoji}
                </div>
                <button
                  onClick={() => speakWord(currentSentence.text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 border border-white"
                  title="Listen out loud"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen Out Loud 🔊</span>
                </button>
              </div>

              {/* Sentence Text with Character Highlighting */}
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 text-2xl sm:text-3xl font-black font-mono my-4 leading-relaxed max-w-2xl text-center">
                {currentSentence.text.split('').map((char, index) => {
                  const typedChar = typedInput[index];
                  let charClass = 'text-slate-400';
                  if (typedChar !== undefined) {
                    if (typedChar.toLowerCase() === char.toLowerCase()) {
                      charClass = 'text-emerald-600 bg-emerald-100 rounded px-1';
                    } else {
                      charClass = 'text-rose-600 bg-rose-100 rounded px-1 animate-pulse';
                    }
                  } else if (index === typedInput.length) {
                    charClass = 'text-slate-900 bg-amber-300 rounded px-1 ring-2 ring-amber-400 animate-pulse';
                  }

                  return (
                    <span key={index} className={`transition-all ${charClass}`}>
                      {char === ' ' ? '␣' : char}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Game View 3: BALLOON POP GAME */}
        {gameMode === 'balloons' && (
          <div className="w-full flex flex-col items-center gap-4 animate-in fade-in duration-300">
            <div className="w-full h-80 sm:h-96 bg-sky-200/80 backdrop-blur-md border-4 border-sky-400 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-between p-4">
              
              {/* Balloon Game Score */}
              <div className="flex items-center justify-between z-20 bg-white/80 px-4 py-2 rounded-2xl border border-sky-300">
                <span className="font-extrabold text-sm text-slate-800">Type words to pop balloons! 🎈</span>
                <span className="font-black text-base text-sky-700 font-mono">Score: {balloonScore}</span>
              </div>

              {/* Balloons Floating Canvas */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                {balloons.map((b) => (
                  <div
                    key={b.id}
                    className={`absolute flex flex-col items-center justify-center w-20 h-24 sm:w-24 sm:h-28 rounded-full shadow-lg border-2 border-white transition-all text-white font-black font-mono text-sm uppercase ${b.color}`}
                    style={{
                      left: `${b.xPercent}%`,
                      top: `${b.yPercent}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <span>{b.word}</span>
                    <div className="w-1 h-6 bg-white/60 absolute -bottom-6"></div>
                  </div>
                ))}
              </div>

              {/* Balloon Input Indicator */}
              <div className="w-full flex justify-center z-20 mt-auto pt-4">
                <div className="bg-white px-6 py-2.5 rounded-2xl border-2 border-sky-400 shadow-lg text-slate-800 font-black font-mono text-xl tracking-wider">
                  {balloonInput || <span className="text-slate-400 font-sans text-sm font-semibold">Type matching word...</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mascot & Encouragement Header (Placed at bottom) */}
        <div className="w-full flex items-center justify-center gap-4 bg-white/50 backdrop-blur-md p-4 rounded-3xl border-2 border-white/60 shadow-lg min-h-[88px] sm:min-h-[96px]">
          <div className="relative flex-shrink-0">
            <div className="text-4xl sm:text-5xl animate-bounce">
              {mascotAction === 'cheer' ? '🦄' : mascotAction === 'think' ? '🐨' : '🦕'}
            </div>
            {streak >= 3 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse shadow-md">
                🔥 {streak}
              </span>
            )}
          </div>
          <div className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs relative min-h-[56px] flex items-center">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent"></div>
            <p className="text-slate-800 font-extrabold text-sm sm:text-base leading-snug">
              {mascotText}
            </p>
          </div>
        </div>

        {/* Game Mode Selector Tabs (Placed at bottom) */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border-2 border-amber-300 shadow-md">
          <button
            onClick={() => {
              setGameMode('alphabet');
              setAlphabetIndex(0);
              setTypedInput('');
              speakWord('A');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              gameMode === 'alphabet' ? 'bg-amber-400 text-slate-900 shadow-md scale-105' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>🔤 Alphabet</span>
          </button>

          <button
            onClick={() => {
              setGameMode('words');
              setTypedInput('');
              setWordIndex(0);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              gameMode === 'words' ? 'bg-amber-400 text-slate-900 shadow-md scale-105' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>🐱 Easy Words</span>
          </button>

          <button
            onClick={() => {
              setGameMode('sentences');
              setTypedInput('');
              setWordIndex(0);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              gameMode === 'sentences' ? 'bg-amber-400 text-slate-900 shadow-md scale-105' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>📚 Sentences</span>
          </button>

          <button
            onClick={() => {
              setGameMode('balloons');
              setBalloonInput('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              gameMode === 'balloons' ? 'bg-amber-400 text-slate-900 shadow-md scale-105' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>🎈 Balloon Pop!</span>
          </button>
        </div>

        {/* Virtual Keyboard (Optional Toggle) */}
        {showVirtualKeyboard && renderVirtualKeyboard()}

      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs font-bold text-slate-600 bg-white/30 backdrop-blur-md border-t border-white/40">
        🎈 Kids Mode Active • Fun & Safe Typing Playground
      </footer>

      {/* Bird Mini-Quiz Modal */}
      <AnimatePresence>
        {activeBirdQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-3xl p-6 sm:p-8 border-4 border-amber-400 shadow-2xl relative flex flex-col items-center text-center"
            >
              {/* Top Sparkle Banner */}
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 border-2 border-white text-slate-900 font-black text-xs sm:text-sm shadow-md mb-4">
                <Sparkles className="w-4 h-4 text-amber-900 animate-spin" />
                <span>BIRD MINI-QUIZ BONUS! 🌟</span>
              </div>

              {/* Question Headline */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 flex flex-wrap items-center justify-center gap-1.5">
                <span>Which illustration is the</span>
                <span className="text-amber-600 underline decoration-wavy underline-offset-4 uppercase">{activeBirdQuiz.targetBird.text}</span>?
              </h3>

              <div className="text-xs sm:text-sm font-semibold text-slate-600 mb-5 flex items-center justify-center gap-2 bg-white/70 px-4 py-1.5 rounded-full border border-amber-200">
                <span>Hint: {activeBirdQuiz.targetBird.hint}</span>
                <button
                  onClick={() => speakWord(`Which illustration is the ${activeBirdQuiz.targetBird.text}? Hint: ${activeBirdQuiz.targetBird.hint}`)}
                  className="p-1 rounded-full bg-amber-200 hover:bg-amber-300 text-slate-800 cursor-pointer transition-transform hover:scale-110"
                  title="Listen question"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* 4 Illustration Choice Cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full mb-4">
                {activeBirdQuiz.options.map((option) => {
                  const isCorrectAnswer = quizFeedback === 'correct' && option.text === activeBirdQuiz.targetBird.text;
                  return (
                    <button
                      key={option.text}
                      onClick={() => handleQuizOptionClick(option)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-4 transition-all cursor-pointer transform hover:scale-105 active:scale-95 shadow-md ${
                        isCorrectAnswer
                          ? 'bg-emerald-200 border-emerald-500 text-emerald-950 ring-4 ring-emerald-300 scale-105'
                          : 'bg-white hover:bg-amber-100/80 border-amber-300/80 text-slate-800'
                      }`}
                    >
                      <div className="text-5xl sm:text-6xl mb-2 drop-shadow-sm transition-transform hover:rotate-6">
                        {option.emoji}
                      </div>
                      <span className="font-extrabold text-sm sm:text-base capitalize tracking-wide text-slate-800">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Interactive Feedback Bar */}
              {quizFeedback === 'correct' && (
                <div className="w-full py-2.5 bg-emerald-400 text-slate-950 font-black rounded-2xl text-base sm:text-lg animate-bounce shadow-md flex items-center justify-center gap-2 border-2 border-emerald-200">
                  <span>🎉 BINGO! BIRD EXPERT! +2 STARS 🌟</span>
                </div>
              )}

              {quizFeedback === 'incorrect' && (
                <div className="w-full py-2 bg-rose-500 text-white font-black rounded-2xl text-sm shadow-md flex items-center justify-center gap-2">
                  <span>Oops! Try another bird! 🐥 You got this!</span>
                </div>
              )}

              {/* Skip quiz button */}
              <button
                onClick={() => {
                  setActiveBirdQuiz(null);
                  setQuizFeedback(null);
                  setTypedInput('');
                  setWordIndex((prev) => (prev + 1) % activeWords.length);
                }}
                className="mt-4 text-xs font-extrabold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Skip Quiz & Continue ➔
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Badges Modal */}
      <AnimatePresence>
        {badgesModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-300 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  <h3 className="text-xl font-black text-slate-900">My Trophy Case 🏆</h3>
                </div>
                <button
                  onClick={() => setBadgesModalOpen(false)}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 my-6">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                      b.unlocked
                        ? 'bg-amber-50 border-amber-300 text-slate-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    <span className="text-3xl">{b.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        {b.name}
                        {b.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setBadgesModalOpen(false)}
                className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-sm shadow-md cursor-pointer"
              >
                Awesome! Let's Keep Typing 🚀
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
