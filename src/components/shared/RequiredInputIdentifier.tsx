interface RequiredInputIdentifier {
  cln?: string;
}

const RequiredInputIdentifier = ({
  cln = "text-destructive",
}: RequiredInputIdentifier) => {
  return <span className={cln}>*</span>;
};

export default RequiredInputIdentifier;
