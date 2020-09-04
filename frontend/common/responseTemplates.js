const responses = {};

responses['killProcess'] = `
Process[] process = Process.GetProcesses();
foreach (Process prs in process)
{
    if (prs.Id == {{ProcessId}})
    {
        prs.Kill();
        return "PID killed";
    }
}
return "PID not found";
`;

responses['enableDetectOnly'] = `
Directory.CreateDirectory("conf/dfpm/detectOnly");
return "";
`;

responses['disableDetectOnly'] = `
Directory.Delete("conf/dfpm/detectOnly");
return "";
`;

module.exports.lookUp = responses;