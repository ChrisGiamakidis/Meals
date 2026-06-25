import classes from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={classes.footer}>
      <p>
        Built for portfolio purposes by{" "}
        <a
          className={classes.link}
          href="https://www.linkedin.com/in/christos-giamakidis-kiosses"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chris Giamakidis
        </a>{" "}
        -{" "}
        <a
          className={classes.link}
          href="https://github.com/ChrisGiamakidis/Meals"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </p>
    </footer>
  );
}
