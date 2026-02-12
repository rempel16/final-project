import {
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CancelIcon from "@mui/icons-material/Cancel";

import styles from "./PostModalMenu.module.scss";

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  isMine: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onGoToPost: () => void;
  onCopyLink: () => void;
  onClose: () => void;
};

export const PostModalMenu = ({
  open,
  anchorEl,
  isMine,
  onEdit,
  onDelete,
  onGoToPost,
  onCopyLink,
  onClose,
}: Props) => {
  return (
    <Menu
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      PaperProps={{ className: styles.paper }}
    >
      {isMine ? (
        <>
          <MenuItem
            onClick={() => {
              onEdit();
              onClose();
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              onDelete();
              onClose();
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </>
      ) : null}

      <MenuItem
        onClick={() => {
          onGoToPost();
          onClose();
        }}
      >
        <ListItemIcon>
          <LinkIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Go to post</ListItemText>
      </MenuItem>

      <MenuItem
        onClick={() => {
          onCopyLink();
          onClose();
        }}
      >
        <ListItemIcon>
          <ContentCopyIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Copy link</ListItemText>
      </MenuItem>

      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <CancelIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Cancel</ListItemText>
      </MenuItem>
    </Menu>
  );
};

