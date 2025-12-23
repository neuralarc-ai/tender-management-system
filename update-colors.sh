#!/bin/bash

# Color Scheme Update Script
# Replaces old color classes with new brand colors

echo "🎨 Starting Color Scheme Update..."
echo "=================================="

# Define file patterns to update
FILES=$(find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -not -path "./build/*")

# Count total files
TOTAL_FILES=$(echo "$FILES" | wc -l)
echo "📁 Found $TOTAL_FILES files to process"
echo ""

# Color replacement mappings
declare -A COLOR_MAP=(
  # Primary (indigo → passion)
  ["indigo-600"]="passion"
  ["indigo-700"]="passion-dark"
  ["indigo-500"]="passion"
  ["indigo-800"]="passion-dark"
  ["indigo-400"]="passion-light"
  ["indigo-300"]="passion-light"
  ["indigo-200"]="passion-light/50"
  ["indigo-100"]="passion-light/30"
  ["indigo-50"]="passion-light/10"
  
  # Blue → passion
  ["blue-600"]="passion"
  ["blue-700"]="passion-dark"
  ["blue-500"]="passion"
  ["blue-800"]="passion-dark"
  ["blue-400"]="drift"
  ["blue-300"]="drift-light"
  ["blue-200"]="drift-light/50"
  ["blue-100"]="drift/20"
  ["blue-50"]="drift/10"
  
  # Purple → quantum
  ["purple-600"]="quantum"
  ["purple-700"]="quantum-dark"
  ["purple-500"]="quantum"
  ["purple-400"]="quantum-light"
  ["purple-300"]="quantum-light"
  ["purple-200"]="quantum-light/50"
  ["purple-100"]="quantum/20"
  ["purple-50"]="quantum/10"
  
  # Amber/Yellow → aurora/solar
  ["amber-600"]="aurora"
  ["amber-700"]="aurora-dark"
  ["amber-500"]="aurora"
  ["amber-800"]="aurora-dark"
  ["amber-400"]="aurora-light"
  ["amber-300"]="aurora-light"
  ["amber-200"]="aurora-light/50"
  ["amber-100"]="aurora/20"
  ["amber-50"]="aurora/10"
  
  ["yellow-500"]="solar"
  ["yellow-600"]="solar"
  ["yellow-400"]="solar-light"
  ["yellow-300"]="solar-light"
  ["yellow-200"]="solar-light/50"
  ["yellow-100"]="solar/20"
  ["yellow-50"]="solar/10"
  
  # Green → verdant
  ["green-600"]="verdant"
  ["green-700"]="verdant-dark"
  ["green-500"]="verdant"
  ["green-800"]="verdant-dark"
  ["green-400"]="verdant-light"
  ["green-300"]="verdant-light"
  ["green-200"]="verdant-light/50"
  ["green-100"]="verdant/20"
  ["green-50"]="verdant/10"
  
  # Red → passion (for errors/destructive)
  ["red-600"]="passion"
  ["red-700"]="passion-dark"
  ["red-500"]="passion"
  ["red-400"]="passion-light"
  ["red-300"]="passion-light"
  ["red-200"]="passion-light/50"
  ["red-100"]="passion-light/30"
  ["red-50"]="passion-light/10"
  
  # Sky → drift
  ["sky-500"]="drift"
  ["sky-600"]="drift"
  ["sky-400"]="drift-light"
  ["sky-300"]="drift-light"
  ["sky-200"]="drift-light/50"
  ["sky-100"]="drift/20"
  ["sky-50"]="drift/10"
  
  # Gray-900 → neural
  ["gray-900"]="neural"
  ["gray-800"]="neural-light"
)

# Function to replace colors in a file
replace_colors() {
  local file=$1
  local changes=0
  
  for old_color in "${!COLOR_MAP[@]}"; do
    new_color="${COLOR_MAP[$old_color]}"
    
    # Replace bg- classes
    if sed -i.bak "s/bg-$old_color/bg-$new_color/g" "$file" 2>/dev/null; then
      ((changes++))
    fi
    
    # Replace text- classes
    if sed -i.bak "s/text-$old_color/text-$new_color/g" "$file" 2>/dev/null; then
      ((changes++))
    fi
    
    # Replace border- classes
    if sed -i.bak "s/border-$old_color/border-$new_color/g" "$file" 2>/dev/null; then
      ((changes++))
    fi
    
    # Replace ring- classes
    if sed -i.bak "s/ring-$old_color/ring-$new_color/g" "$file" 2>/dev/null; then
      ((changes++))
    fi
    
    # Replace shadow- classes
    if sed -i.bak "s/shadow-$old_color/shadow-$new_color/g" "$file" 2>/dev/null; then
      ((changes++))
    fi
    
    # Replace from- classes (gradients)
    if sed -i.bak "s/from-$old_color/from-$new_color/g" "$file" 2>/dev/null; then
      ((changes++))
    fi
    
    # Replace to- classes (gradients)
    if sed -i.bak "s/to-$old_color/to-$new_color/g" "$file" 2>/dev/null; then
      ((changes++))
    fi
    
    # Replace via- classes (gradients)
    if sed -i.bak "s/via-$old_color/via-$new_color/g" "$file" 2>/dev/null; then
      ((changes++))
    fi
  done
  
  # Remove backup files
  rm -f "$file.bak"
  
  echo $changes
}

# Process each file
PROCESSED=0
TOTAL_CHANGES=0

for file in $FILES; do
  ((PROCESSED++))
  changes=$(replace_colors "$file")
  ((TOTAL_CHANGES+=changes))
  
  if [ $changes -gt 0 ]; then
    echo "✅ $file ($changes changes)"
  fi
  
  # Progress indicator
  if [ $((PROCESSED % 10)) -eq 0 ]; then
    echo "📊 Progress: $PROCESSED/$TOTAL_FILES files processed..."
  fi
done

echo ""
echo "=================================="
echo "✨ Color Update Complete!"
echo "📊 Processed: $PROCESSED files"
echo "🎨 Total changes: $TOTAL_CHANGES"
echo ""
echo "⚠️  IMPORTANT: Review changes and test thoroughly!"
echo "💡 TIP: Run 'git diff' to see all changes"
echo ""

