import PropTypes from 'prop-types';
import { useEffect, useRef, useState, useContext } from "react";
import { setNewOffset, autoGrow, setZIndex, bodyParser } from '../utils';
import { db } from '../appwrite/databases';
import Spinner from '../icons/Spinner';
import DeleteButton from './DeleteButton';
import { NoteContext } from '../context/NoteContext';

const NoteCard = ({ note }) => {
  let mouseStartPos = { x: 0, y: 0 };
  const cardRef = useRef(null);

  const { setSelectedNote } = useContext(NoteContext);

  const [saving, setSaving] = useState(false);
  const keyUpTimer = useRef(null);

  const [position, setPosition] = useState(JSON.parse(note.position));
  const colors = JSON.parse(note.colors);
  const body = bodyParser(note.body);

  const textAreaRef = useRef(null);

  useEffect(() => {
    autoGrow(textAreaRef);
    setZIndex(cardRef.current);
  }, []);

  const mouseDown = (e) => {
    if (e.target.className === "card-header") {
        mouseStartPos.x = e.clientX;
        mouseStartPos.y = e.clientY;

        setZIndex(cardRef.current);

        document.addEventListener("mousemove", mouseMove);
        document.addEventListener("mouseup", mouseUp);
        setSelectedNote(note);
    }
};

const mouseMove = (e) => {
  const mouseMoveDir = {
      x: mouseStartPos.x - e.clientX,
      y: mouseStartPos.y - e.clientY,
  };

  mouseStartPos.x = e.clientX;
  mouseStartPos.y = e.clientY;

  const newPosition = setNewOffset(cardRef.current, mouseMoveDir);
  setPosition(newPosition);
};

  const mouseUp = () => {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);

    const newPosition = setNewOffset(cardRef.current);
    saveData("position", newPosition);
  };

  const saveData = async (key, value) => {
    const payload = { [key]: JSON.stringify(value) };
    try {
      await db.notes.update(note.$id, payload);
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  };

  const handleKeyUp = async () => {
    // 1 - Initiate "saving" state
    setSaving(true);

    // 2 - Clear timer ID if it exists to add another two seconds
    if (keyUpTimer.current) {
      clearTimeout(keyUpTimer.current);
    }

    // 3 - Set timer to trigger save in 2 seconds
    keyUpTimer.current = setTimeout(() => {
      saveData("body", textAreaRef.current.value);
    }, 2000);
  };

  return (
    <div
      ref={cardRef}
      className="card"
      style={{
        backgroundColor: colors.colorBody,
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        onMouseDown={mouseDown}
        className="card-header"
        style={{
          backgroundColor: colors.colorHeader,
        }}
      >
        <DeleteButton noteId={note.$id} />

        {saving && (
          <div className="card-saving">
            <Spinner color={colors.colorText} />
            <span style={{ color: colors.colorText }}>
              Saving...
            </span>
          </div>
        )}
      </div>

      <div className="card-body">
        <textarea
          ref={textAreaRef}
          onKeyUp={handleKeyUp}
          onFocus={() => {
            setZIndex(cardRef.current);
            setSelectedNote(note);
          }}
          onInput={() => {
            autoGrow(textAreaRef);
          }}
          style={{ color: colors.colorText }}
          defaultValue={body}
        ></textarea>
      </div>
    </div>
  );
};

NoteCard.propTypes = {
  note: PropTypes.shape({
    $id: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    colors: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
  })
};

export default NoteCard;
