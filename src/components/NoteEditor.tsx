import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createEditor, Descendant, Editor, Transforms, Element as SlateElement, Text, Node as SlateNode, Range, Point } from 'slate';
import { Slate, Editable, withReact, ReactEditor, RenderLeafProps, RenderElementProps } from 'slate-react';
import { withHistory } from 'slate-history';
import { FaBold, FaItalic, FaUnderline, FaHeading, FaListUl, FaListOl } from 'react-icons/fa';
import '../styles/components/NoteEditor.css';

// Define custom types for Slate
type CustomElement = { 
  type: 'paragraph' | 'heading-one' | 'heading-two' | 'bulleted-list' | 'numbered-list' | 'list-item'; 
  children: CustomText[] 
};
type CustomText = { text: string; bold?: boolean; italic?: boolean; underline?: boolean; };

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
    Text: CustomText;
  }
}

// Initial value for Slate editor
const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

// Helper to serialize the Slate document to a string with formatting
const serializeToString = (nodes: Descendant[]): string => {
  // Convert to JSON to preserve formatting
  return JSON.stringify(nodes);
};

// Helper to deserialize from string with formatting
const deserializeFromString = (text: string): Descendant[] => {
  if (!text) return initialValue;
  
  try {
    // Try to parse as JSON (formatted content)
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : initialValue;
  } catch (e) {
    // If parsing fails, fallback to plain text conversion
    // This handles legacy plain text notes
    const lines = text.split('\n');
    return lines.map(line => ({
      type: 'paragraph',
      children: [{ text: line }],
    }));
  }
};

// Defines whether the mark is active in the current selection
const isMarkActive = (editor: Editor, format: keyof Omit<CustomText, 'text'>) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

// Toggles a mark on the current selection
const toggleMark = (editor: Editor, format: keyof Omit<CustomText, 'text'>) => {
  const isActive = isMarkActive(editor, format);
  
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// Defines whether the block type is active
const isBlockActive = (editor: Editor, format: string) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n => 
        !Editor.isEditor(n) && 
        SlateElement.isElement(n) && 
        n.type === format,
    })
  );

  return !!match;
};

// Toggles a block type
const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = format === 'bulleted-list' || format === 'numbered-list';

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      ['bulleted-list', 'numbered-list'].includes(n.type),
    split: true,
  });

  // Type-safe block type
  const blockType = isActive 
    ? 'paragraph' 
    : isList 
      ? 'list-item' 
      : format as 'paragraph' | 'heading-one' | 'heading-two' | 'list-item';
  
  Transforms.setNodes(editor, { type: blockType });

  if (!isActive && isList) {
    const listType = format as 'bulleted-list' | 'numbered-list';
    const block = { type: listType, children: [] } as CustomElement;
    Transforms.wrapNodes(editor, block);
  }
};

// Define a button component for the toolbar
interface FormatButtonProps {
  format: keyof Omit<CustomText, 'text'>;
  icon: React.ReactNode;
  editor: Editor;
}

const FormatButton: React.FC<FormatButtonProps> = ({ format, icon, editor }) => {
  const isActive = isMarkActive(editor, format);
  
  return (
    <button
      className={`format-button ${isActive ? 'active' : ''}`}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      title={format.charAt(0).toUpperCase() + format.slice(1)}
    >
      {icon}
    </button>
  );
};

// Define a button component for block formatting
interface BlockButtonProps {
  format: string;
  icon: React.ReactNode;
  editor: Editor;
}

const BlockButton: React.FC<BlockButtonProps> = ({ format, icon, editor }) => {
  const isActive = isBlockActive(editor, format);
  
  return (
    <button
      className={`format-button ${isActive ? 'active' : ''}`}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      title={format.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
    >
      {icon}
    </button>
  );
};

// Leaf component for rendering formatted text
const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  let styledChildren = children;
  
  // Apply formatting in a consistent order
  if (leaf.bold) {
    styledChildren = <strong>{styledChildren}</strong>;
  }
  
  if (leaf.italic) {
    styledChildren = <em>{styledChildren}</em>;
  }
  
  if (leaf.underline) {
    styledChildren = <u>{styledChildren}</u>;
  }
  
  return <span {...attributes}>{styledChildren}</span>;
};

// Helper to convert Slate content to HTML
const slateToHtml = (nodes: Descendant[]): string => {
  let html = '';
  
  // Process each node
  for (const node of nodes) {
    if (SlateElement.isElement(node)) {
      switch (node.type) {
        case 'paragraph': {
          let paragraphHtml = '<p>';
          // Process children (text nodes)
          for (const child of node.children) {
            let textHtml = child.text;
            // Apply formatting
            if (child.bold) textHtml = `<strong>${textHtml}</strong>`;
            if (child.italic) textHtml = `<em>${textHtml}</em>`;
            if (child.underline) textHtml = `<u>${textHtml}</u>`;
            paragraphHtml += textHtml;
          }
          paragraphHtml += '</p>';
          html += paragraphHtml;
          break;
        }
        case 'heading-one': {
          let headingHtml = '<h1>';
          for (const child of node.children) {
            let textHtml = child.text;
            if (child.bold) textHtml = `<strong>${textHtml}</strong>`;
            if (child.italic) textHtml = `<em>${textHtml}</em>`;
            if (child.underline) textHtml = `<u>${textHtml}</u>`;
            headingHtml += textHtml;
          }
          headingHtml += '</h1>';
          html += headingHtml;
          break;
        }
        case 'heading-two': {
          let headingHtml = '<h2>';
          for (const child of node.children) {
            let textHtml = child.text;
            if (child.bold) textHtml = `<strong>${textHtml}</strong>`;
            if (child.italic) textHtml = `<em>${textHtml}</em>`;
            if (child.underline) textHtml = `<u>${textHtml}</u>`;
            headingHtml += textHtml;
          }
          headingHtml += '</h2>';
          html += headingHtml;
          break;
        }
        case 'bulleted-list': {
          let listHtml = '<ul>';
          // List items are processed recursively
          for (const childNode of node.children) {
            if (SlateElement.isElement(childNode) && childNode.type === 'list-item') {
              let itemHtml = '<li>';
              for (const textNode of childNode.children) {
                let textHtml = textNode.text;
                if (textNode.bold) textHtml = `<strong>${textHtml}</strong>`;
                if (textNode.italic) textHtml = `<em>${textHtml}</em>`;
                if (textNode.underline) textHtml = `<u>${textHtml}</u>`;
                itemHtml += textHtml;
              }
              itemHtml += '</li>';
              listHtml += itemHtml;
            }
          }
          listHtml += '</ul>';
          html += listHtml;
          break;
        }
        case 'numbered-list': {
          let listHtml = '<ol>';
          // List items are processed recursively
          for (const childNode of node.children) {
            if (SlateElement.isElement(childNode) && childNode.type === 'list-item') {
              let itemHtml = '<li>';
              for (const textNode of childNode.children) {
                let textHtml = textNode.text;
                if (textNode.bold) textHtml = `<strong>${textHtml}</strong>`;
                if (textNode.italic) textHtml = `<em>${textHtml}</em>`;
                if (textNode.underline) textHtml = `<u>${textHtml}</u>`;
                itemHtml += textHtml;
              }
              itemHtml += '</li>';
              listHtml += itemHtml;
            }
          }
          listHtml += '</ol>';
          html += listHtml;
          break;
        }
      }
    }
  }
  
  return html;
};

// Helper to extract plain text from Slate document
export const getPlainTextFromSlate = (nodes: Descendant[]): string => {
  if (!nodes) return '';
  try {
    // If it's a string (legacy format), just return it
    if (typeof nodes === 'string') return nodes;
    
    // If it's a Slate document, extract the text
    return nodes.map(n => SlateNode.string(n)).join('\n');
  } catch (e) {
    console.error('Error extracting plain text from Slate document:', e);
    return '';
  }
};

// Define a custom element renderer
const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

// Create a custom editor with Markdown-like shortcut handling
const withShortcuts = (editor: Editor) => {
  const { deleteBackward, insertText } = editor;

  // Override insertText to handle Markdown shortcuts
  editor.insertText = (text) => {
    const { selection } = editor;

    // Check if we should handle a Markdown shortcut
    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      });
      if (block) {
        const [, path] = block;
        const start = Editor.start(editor, path);
        const range = { anchor, focus: start };
        const beforeText = Editor.string(editor, range);

        // Handle different Markdown shortcuts
        if (beforeText === '#') {
          // Convert to heading-one
          Transforms.select(editor, range);
          Transforms.delete(editor);
          Transforms.setNodes(
            editor,
            { type: 'heading-one' } as Partial<CustomElement>,
            { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
          );
          return;
        }

        if (beforeText === '##') {
          // Convert to heading-two
          Transforms.select(editor, range);
          Transforms.delete(editor);
          Transforms.setNodes(
            editor,
            { type: 'heading-two' } as Partial<CustomElement>,
            { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
          );
          return;
        }

        // Support for bulleted list with "-" or "*"
        if (beforeText === '-' || beforeText === '*') {
          Transforms.select(editor, range);
          Transforms.delete(editor);
          
          // Check if we're already in a list
          const isInList = Editor.above(editor, {
            match: n => SlateElement.isElement(n) && n.type === 'bulleted-list',
          });
          
          if (!isInList) {
            // Convert to list item
            Transforms.setNodes(
              editor,
              { type: 'list-item' } as Partial<CustomElement>,
                { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
              );
            
            // Wrap in bulleted list
            Transforms.wrapNodes(
              editor,
              { type: 'bulleted-list', children: [] } as CustomElement
            );
          } else {
            // Already in a list, just convert the current block to list-item
            Transforms.setNodes(
              editor,
              { type: 'list-item' } as Partial<CustomElement>,
                { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
              );
          }
          return;
        }

        // Support for numbered list with "1."
        if (beforeText === '1.') {
          Transforms.select(editor, range);
          Transforms.delete(editor);
          
          // Check if we're already in a list
          const isInList = Editor.above(editor, {
            match: n => SlateElement.isElement(n) && n.type === 'numbered-list',
          });
          
          if (!isInList) {
            // Convert to list item
            Transforms.setNodes(
              editor,
              { type: 'list-item' } as Partial<CustomElement>,
                { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
              );
            
            // Wrap in numbered list
            Transforms.wrapNodes(
              editor,
              { type: 'numbered-list', children: [] } as CustomElement
            );
          } else {
            // Already in a list, just convert the current block to list-item
            Transforms.setNodes(
              editor,
              { type: 'list-item' } as Partial<CustomElement>,
              { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
            );
          }
          return;
        }
      }
    }

    // Default behavior for all other cases
    insertText(text);
  };

  // Override deleteBackward to handle special case when deleting an empty heading or list item
  editor.deleteBackward = (...args) => {
    const { selection } = editor;
    
    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      });
      
      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);
        
        if (
          SlateElement.isElement(block) &&
          (block.type === 'heading-one' || 
           block.type === 'heading-two' || 
           block.type === 'list-item') &&
          Point.equals(selection.anchor, start)
        ) {
          // If at the start of a heading or list item and pressing backspace, convert back to paragraph
          // For list items, also unwrap from parent list if needed
          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: n => SlateElement.isElement(n) && 
                (n.type === 'bulleted-list' || n.type === 'numbered-list'),
              split: true
            });
          }
          
          Transforms.setNodes(
            editor, 
            { type: 'paragraph' } as Partial<CustomElement>,
            { match: n => SlateElement.isElement(n) }
          );
          return;
        }
      }
    }
    
    deleteBackward(...args);
  };

  return editor;
};

interface NoteEditorProps {
  initialContent?: string;
  initialTitle?: string;
  onSave: (content: string, title: string) => void;
  onCreateFlashcards?: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  initialContent = '', 
  initialTitle = 'Untitled Note',
  onSave,
  onCreateFlashcards
}) => {
  // Set up the Slate editor with plugins
  const editor = useMemo(() => withShortcuts(withHistory(withReact(createEditor()))), []);
  
  // Convert initialContent to Slate value
  const initialSlateValue = useMemo(() => 
    deserializeFromString(initialContent), 
    [initialContent]
  );
  
  // Track content and title state
  const [content, setContent] = useState<Descendant[]>(initialSlateValue);
  const [title, setTitle] = useState<string>(() => initialTitle);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const hasFocusRef = useRef<boolean>(false);
  
  // Track component instance with an instance ID for debugging
  const instanceId = useMemo(() => Math.random().toString(36).substring(2, 9), []);
  
  // Mount logging
  useEffect(() => {
    console.log(`[NoteEditor ${instanceId}] Mounted with initial content:`, initialContent?.substring(0, 20));
    console.log(`[NoteEditor ${instanceId}] Mounted with initial title:`, initialTitle);
    
    // Clean up timeout on unmount
    return () => {
      console.log(`[NoteEditor ${instanceId}] Unmounting, clearing timeout`);
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [instanceId, initialContent, initialTitle, saveTimeout]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as HTMLElement)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // This effect will run when initialContent changes
  useEffect(() => {
    console.log(`[NoteEditor ${instanceId}] initialContent changed:`, initialContent?.substring(0, 20));
    setContent(deserializeFromString(initialContent));
  }, [initialContent, instanceId]);

  // This effect will run when initialTitle changes
  useEffect(() => {
    console.log(`[NoteEditor ${instanceId}] initialTitle changed:`, initialTitle);
    setTitle(initialTitle);
  }, [initialTitle, instanceId]);

  // Track focus state of the editor
  useEffect(() => {
    const handleFocus = () => {
      hasFocusRef.current = true;
    };
    
    const handleBlur = () => {
      hasFocusRef.current = false;
    };
    
    const editorElement = editorRef.current;
    if (editorElement) {
      editorElement.addEventListener('focus', handleFocus, true);
      editorElement.addEventListener('blur', handleBlur, true);
      
      return () => {
        editorElement.removeEventListener('focus', handleFocus, true);
        editorElement.removeEventListener('blur', handleBlur, true);
      };
    }
  }, []);

  const autoSave = useCallback((newContent: Descendant[], newTitle: string) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeout = setTimeout(() => {
      const serializedContent = serializeToString(newContent);
      console.log(`[NoteEditor ${instanceId}] Auto-saving content:`, serializedContent.substring(0, 20));
      console.log(`[NoteEditor ${instanceId}] Auto-saving title:`, newTitle);
      
      // Store if the editor was focused
      const wasFocused = hasFocusRef.current;
      
      // Save the note
      onSave(serializedContent, newTitle);
      
      // Restore focus if it was focused before
      if (wasFocused && editorRef.current) {
        requestAnimationFrame(() => {
          if (ReactEditor.isFocused(editor)) return;
          try {
            ReactEditor.focus(editor);
          } catch (err) {
            console.error('Error focusing editor:', err);
          }
        });
      }
    }, 1000);
    
    setSaveTimeout(timeout);
  }, [saveTimeout, onSave, instanceId, editor]);

  const handleContentChange = useCallback((newContent: Descendant[]) => {
    setContent(newContent);
    autoSave(newContent, title);
  }, [autoSave, title]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    autoSave(content, newTitle);
  }, [autoSave, content]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Handle keyboard shortcuts for formatting
    if (!event.ctrlKey && !event.metaKey) return;

    switch (event.key) {
      case 'b': {
        event.preventDefault();
        toggleMark(editor, 'bold');
        break;
      }
      case 'i': {
        event.preventDefault();
        toggleMark(editor, 'italic');
        break;
      }
      case 'u': {
        event.preventDefault();
        toggleMark(editor, 'underline');
        break;
      }
    }
  }, [editor]);

  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  const renderElement = useCallback((props: RenderElementProps) => {
    return <Element {...props} />;
  }, []);

  const exportAsHtml = useCallback(() => {
    const html = slateToHtml(content);
    
    // Create a blob and download link
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'note'}.html`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Close dropdown
    setShowDropdown(false);
  }, [content, title]);

  return (
    <div className="note-editor">
      <div className="note-editor-header">
        <input 
          type="text" 
          className="note-title-input" 
          value={title} 
          onChange={handleTitleChange}
          placeholder="Note Title"
        />
        <div className="dropdown-container" ref={dropdownRef}>
          <button 
            className="dropdown-btn"
            onClick={toggleDropdown}
            title="Options"
          >
            <span className="ellipsis">•••</span>
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              {onCreateFlashcards && (
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    onCreateFlashcards();
                    setShowDropdown(false);
                  }}
                >
                  Create Flashcards
                </button>
              )}
              <button 
                className="dropdown-item"
                onClick={exportAsHtml}
              >
                Export as HTML
              </button>
              <button 
                className="dropdown-item"
                title="Markdown Shortcuts Help"
                onClick={() => {
                  alert(
                    "Markdown Shortcuts:\n" +
                    "# + space: Heading 1\n" +
                    "## + space: Heading 2\n" +
                    "- or * + space: Bulleted list\n" +
                    "1. + space: Numbered list\n" +
                    "Ctrl/Cmd + B: Bold\n" +
                    "Ctrl/Cmd + I: Italic\n" +
                    "Ctrl/Cmd + U: Underline"
                  );
                  setShowDropdown(false);
                }}
              >
                Formatting Help
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div 
        ref={editorRef} 
        className="slate-editor-container"
      >
        <Slate
          editor={editor}
          initialValue={content}
          onChange={handleContentChange}
        >
          <Editable
            className="note-content-area"
            renderLeaf={renderLeaf}
            renderElement={renderElement}
            onKeyDown={handleKeyDown}
            spellCheck={true}
            autoFocus={true}
          />
        </Slate>
      </div>
    </div>
  );
};

export default React.memo(NoteEditor); 