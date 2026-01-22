'use client';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  AccessibilityHelp,
  Alignment,
  AutoImage,
  AutoLink,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  Bold,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  ImageBlock,
  ImageCaption,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Mention,
  PageBreak,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TableSelection,
  TextTransformation,
  TodoList,
  Underline,
  Undo,
  Base64UploadAdapter,
  type EditorConfig,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import '@/styles/ckeditor-custom.css';

interface RichTextEditorProps {
  value?: string;
  onChange?: (data: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  disabled = false,
  minHeight = '400px',
}: RichTextEditorProps) {
  const editorConfig: EditorConfig = {
    licenseKey: 'GPL', // Use GPL for open source projects
    toolbar: {
      items: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'fontSize',
        'fontFamily',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'code',
        'subscript',
        'superscript',
        'removeFormat',
        '|',
        'alignment',
        '|',
        'bulletedList',
        'numberedList',
        'todoList',
        '|',
        'outdent',
        'indent',
        '|',
        'link',
        'insertImage',
        'insertTable',
        'mediaEmbed',
        'blockQuote',
        'codeBlock',
        'horizontalLine',
        'pageBreak',
        '|',
        'highlight',
        'specialCharacters',
        '|',
        'findAndReplace',
        'selectAll',
        '|',
        'accessibilityHelp',
      ],
      shouldNotGroupWhenFull: true,
    },
    plugins: [
      AccessibilityHelp,
      Alignment,
      AutoImage,
      AutoLink,
      Autosave,
      BalloonToolbar,
      Base64UploadAdapter,
      BlockQuote,
      Bold,
      Code,
      CodeBlock,
      Essentials,
      FindAndReplace,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      GeneralHtmlSupport,
      Heading,
      Highlight,
      HorizontalLine,
      ImageBlock,
      ImageCaption,
      ImageInsert,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      LinkImage,
      List,
      ListProperties,
      MediaEmbed,
      Mention,
      PageBreak,
      Paragraph,
      PasteFromOffice,
      RemoveFormat,
      SelectAll,
      SpecialCharacters,
      SpecialCharactersArrows,
      SpecialCharactersCurrency,
      SpecialCharactersEssentials,
      SpecialCharactersLatin,
      SpecialCharactersMathematical,
      SpecialCharactersText,
      Strikethrough,
      Subscript,
      Superscript,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TableSelection, // Critical for merge cells to work
      TextTransformation,
      TodoList,
      Underline,
      Undo,
    ],
    balloonToolbar: ['bold', 'italic', '|', 'link', '|', 'bulletedList', 'numberedList'],
    fontFamily: {
      options: [
        'default',
        'Arial, Helvetica, sans-serif',
        'Courier New, Courier, monospace',
        'Georgia, serif',
        'Lucida Sans Unicode, Lucida Grande, sans-serif',
        'Tahoma, Geneva, sans-serif',
        'Times New Roman, Times, serif',
        'Trebuchet MS, Helvetica, sans-serif',
        'Verdana, Geneva, sans-serif',
      ],
      supportAllValues: true,
    },
    fontSize: {
      options: [10, 12, 14, 'default', 18, 20, 22, 24, 26, 28, 36, 48, 72],
      supportAllValues: true,
    },
    heading: {
      options: [
        {
          model: 'paragraph',
          title: 'Paragraph',
          class: 'ck-heading_paragraph',
        },
        {
          model: 'heading1',
          view: 'h1',
          title: 'Heading 1',
          class: 'ck-heading_heading1',
        },
        {
          model: 'heading2',
          view: 'h2',
          title: 'Heading 2',
          class: 'ck-heading_heading2',
        },
        {
          model: 'heading3',
          view: 'h3',
          title: 'Heading 3',
          class: 'ck-heading_heading3',
        },
        {
          model: 'heading4',
          view: 'h4',
          title: 'Heading 4',
          class: 'ck-heading_heading4',
        },
        {
          model: 'heading5',
          view: 'h5',
          title: 'Heading 5',
          class: 'ck-heading_heading5',
        },
        {
          model: 'heading6',
          view: 'h6',
          title: 'Heading 6',
          class: 'ck-heading_heading6',
        },
      ],
    },
    htmlSupport: {
      allow: [
        {
          name: /^.*$/,
          styles: true,
          attributes: true,
          classes: true,
        },
      ],
    },
    image: {
      toolbar: [
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'imageStyle:alignLeft',
        'imageStyle:alignCenter',
        'imageStyle:alignRight',
        '|',
        'resizeImage',
        '|',
        'linkImage',
      ],
      insert: {
        integrations: ['url'],
      },
      resizeUnit: 'px',
      resizeOptions: [
        {
          name: 'resizeImage:original',
          label: 'Original',
          value: null,
        },
        {
          name: 'resizeImage:25',
          label: '25%',
          value: '25',
        },
        {
          name: 'resizeImage:50',
          label: '50%',
          value: '50',
        },
        {
          name: 'resizeImage:75',
          label: '75%',
          value: '75',
        },
        {
          name: 'resizeImage:100',
          label: '100%',
          value: '100',
        },
      ],
      styles: {
        options: [
          'alignLeft',
          'alignCenter',
          'alignRight',
          'alignBlockLeft',
          'alignBlockRight',
          'block',
          'side',
        ],
      },
    },
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: 'https://',
      decorators: {
        toggleDownloadable: {
          mode: 'manual',
          label: 'Downloadable',
          attributes: {
            download: 'file',
          },
        },
        openInNewTab: {
          mode: 'manual',
          label: 'Open in a new tab',
          defaultValue: true,
          attributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        },
      },
    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true,
      },
    },
    mention: {
      feeds: [
        {
          marker: '@',
          feed: [
            '@apple',
            '@bears',
            '@brownie',
            '@cake',
            '@candy',
            '@canes',
            '@chocolate',
            '@cookie',
            '@cotton',
            '@cream',
            '@cupcake',
            '@danish',
            '@donut',
            '@dragée',
            '@fruitcake',
            '@gingerbread',
            '@gummi',
            '@ice',
            '@jelly-o',
            '@liquorice',
            '@macaroon',
            '@marzipan',
            '@oat',
            '@pie',
            '@plum',
            '@pudding',
            '@sesame',
            '@snaps',
            '@soufflé',
            '@sugar',
            '@sweet',
            '@topping',
            '@wafer',
          ],
          minimumCharacters: 1,
        },
      ],
    },
    placeholder,
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableProperties',
        'tableCellProperties',
        'toggleTableCaption',
      ],
      tableProperties: {
        borderColors: [
          {
            color: 'hsl(0, 0%, 0%)',
            label: 'Black',
          },
          {
            color: 'hsl(0, 0%, 30%)',
            label: 'Dim grey',
          },
          {
            color: 'hsl(0, 0%, 60%)',
            label: 'Grey',
          },
          {
            color: 'hsl(0, 0%, 90%)',
            label: 'Light grey',
          },
          {
            color: 'hsl(0, 0%, 100%)',
            label: 'White',
            hasBorder: true,
          },
          {
            color: 'hsl(0, 75%, 60%)',
            label: 'Red',
          },
          {
            color: 'hsl(30, 75%, 60%)',
            label: 'Orange',
          },
          {
            color: 'hsl(60, 75%, 60%)',
            label: 'Yellow',
          },
          {
            color: 'hsl(90, 75%, 60%)',
            label: 'Light green',
          },
          {
            color: 'hsl(120, 75%, 60%)',
            label: 'Green',
          },
          {
            color: 'hsl(150, 75%, 60%)',
            label: 'Aquamarine',
          },
          {
            color: 'hsl(180, 75%, 60%)',
            label: 'Turquoise',
          },
          {
            color: 'hsl(210, 75%, 60%)',
            label: 'Light blue',
          },
          {
            color: 'hsl(240, 75%, 60%)',
            label: 'Blue',
          },
          {
            color: 'hsl(270, 75%, 60%)',
            label: 'Purple',
          },
        ],
        backgroundColors: [
          {
            color: 'hsl(0, 0%, 0%)',
            label: 'Black',
          },
          {
            color: 'hsl(0, 0%, 30%)',
            label: 'Dim grey',
          },
          {
            color: 'hsl(0, 0%, 60%)',
            label: 'Grey',
          },
          {
            color: 'hsl(0, 0%, 90%)',
            label: 'Light grey',
          },
          {
            color: 'hsl(0, 0%, 100%)',
            label: 'White',
            hasBorder: true,
          },
          {
            color: 'hsl(0, 75%, 60%)',
            label: 'Red',
          },
          {
            color: 'hsl(30, 75%, 60%)',
            label: 'Orange',
          },
          {
            color: 'hsl(60, 75%, 60%)',
            label: 'Yellow',
          },
          {
            color: 'hsl(90, 75%, 60%)',
            label: 'Light green',
          },
          {
            color: 'hsl(120, 75%, 60%)',
            label: 'Green',
          },
          {
            color: 'hsl(150, 75%, 60%)',
            label: 'Aquamarine',
          },
          {
            color: 'hsl(180, 75%, 60%)',
            label: 'Turquoise',
          },
          {
            color: 'hsl(210, 75%, 60%)',
            label: 'Light blue',
          },
          {
            color: 'hsl(240, 75%, 60%)',
            label: 'Blue',
          },
          {
            color: 'hsl(270, 75%, 60%)',
            label: 'Purple',
          },
        ],
      },
      tableCellProperties: {
        borderColors: [
          {
            color: 'hsl(0, 0%, 0%)',
            label: 'Black',
          },
          {
            color: 'hsl(0, 0%, 30%)',
            label: 'Dim grey',
          },
          {
            color: 'hsl(0, 0%, 60%)',
            label: 'Grey',
          },
          {
            color: 'hsl(0, 0%, 90%)',
            label: 'Light grey',
          },
          {
            color: 'hsl(0, 0%, 100%)',
            label: 'White',
            hasBorder: true,
          },
          {
            color: 'hsl(0, 75%, 60%)',
            label: 'Red',
          },
          {
            color: 'hsl(30, 75%, 60%)',
            label: 'Orange',
          },
          {
            color: 'hsl(60, 75%, 60%)',
            label: 'Yellow',
          },
          {
            color: 'hsl(90, 75%, 60%)',
            label: 'Light green',
          },
          {
            color: 'hsl(120, 75%, 60%)',
            label: 'Green',
          },
          {
            color: 'hsl(150, 75%, 60%)',
            label: 'Aquamarine',
          },
          {
            color: 'hsl(180, 75%, 60%)',
            label: 'Turquoise',
          },
          {
            color: 'hsl(210, 75%, 60%)',
            label: 'Light blue',
          },
          {
            color: 'hsl(240, 75%, 60%)',
            label: 'Blue',
          },
          {
            color: 'hsl(270, 75%, 60%)',
            label: 'Purple',
          },
        ],
        backgroundColors: [
          {
            color: 'hsl(0, 0%, 0%)',
            label: 'Black',
          },
          {
            color: 'hsl(0, 0%, 30%)',
            label: 'Dim grey',
          },
          {
            color: 'hsl(0, 0%, 60%)',
            label: 'Grey',
          },
          {
            color: 'hsl(0, 0%, 90%)',
            label: 'Light grey',
          },
          {
            color: 'hsl(0, 0%, 100%)',
            label: 'White',
            hasBorder: true,
          },
          {
            color: 'hsl(0, 75%, 60%)',
            label: 'Red',
          },
          {
            color: 'hsl(30, 75%, 60%)',
            label: 'Orange',
          },
          {
            color: 'hsl(60, 75%, 60%)',
            label: 'Yellow',
          },
          {
            color: 'hsl(90, 75%, 60%)',
            label: 'Light green',
          },
          {
            color: 'hsl(120, 75%, 60%)',
            label: 'Green',
          },
          {
            color: 'hsl(150, 75%, 60%)',
            label: 'Aquamarine',
          },
          {
            color: 'hsl(180, 75%, 60%)',
            label: 'Turquoise',
          },
          {
            color: 'hsl(210, 75%, 60%)',
            label: 'Light blue',
          },
          {
            color: 'hsl(240, 75%, 60%)',
            label: 'Blue',
          },
          {
            color: 'hsl(270, 75%, 60%)',
            label: 'Purple',
          },
        ],
      },
    },
  };

  return (
    <div className="ckeditor-wrapper" style={{ minHeight }}>
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        data={value}
        disabled={disabled}
        disableWatchdog={true}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange?.(data);
        }}
      />
    </div>
  );
}
